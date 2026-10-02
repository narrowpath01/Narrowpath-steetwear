import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { items, addressData } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    if (!addressData || !addressData.firstName || !addressData.street || !addressData.pinCode || !addressData.phoneNumber) {
      return NextResponse.json({ error: "Please fill out the entire shipping form" }, { status: 400 });
    }

    // Resolve or Auto-Create User (supports both Logged-In and Guest checkouts)
    let userId = session?.user?.id;

    if (!userId) {
      const cleanPhone = addressData.phoneNumber ? addressData.phoneNumber.toString().replace(/\D/g, "").slice(-10) : null;
      const cleanEmail = addressData.email ? addressData.email.toString().trim().toLowerCase() : null;

      let user = null;
      if (cleanPhone && cleanPhone.length === 10) {
        user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      }
      if (!user && cleanEmail) {
        user = await prisma.user.findFirst({ where: { email: cleanEmail } });
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: `${addressData.firstName || ""} ${addressData.lastName || ""}`.trim() || "Customer",
            phone: cleanPhone && cleanPhone.length === 10 ? cleanPhone : null,
            email: cleanEmail || null,
          }
        });
      }
      userId = user.id;
    }

    // 1. SECURE SERVER-SIDE PRICE AND INVENTORY VALIDATION
    // Never trust frontend prices. We verify every variant ID against the database.
    const variantIds = items.map((i: any) => i.variant?.id || i.variantId).filter(Boolean);
    const dbVariants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true }
    });

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    for (const item of items) {
      const vid = item.variant?.id || item.variantId;
      const dbVar = variantMap.get(vid);
      if (!dbVar) {
        return NextResponse.json({ error: "One or more products in your cart are no longer available." }, { status: 400 });
      }
      if (dbVar.inventory < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${dbVar.product?.title || "item"} (${dbVar.title}). Only ${dbVar.inventory} remaining.`
        }, { status: 400 });
      }
    }

    // Calculate base amount strictly using database prices
    const baseAmount = items.reduce((acc: number, item: any) => {
      const vid = item.variant?.id || item.variantId;
      const dbVar = variantMap.get(vid)!;
      return acc + (dbVar.price * item.quantity);
    }, 0);

    // 2. SECURE SHIPPING RECALCULATION
    // We do NOT trust the frontend fee. We recalculate it directly with Delhivery here.
    const estimatedWeight = items.reduce((acc: number, item: any) => acc + (500 * item.quantity), 0);
    let finalShippingFee = 100; // Fallback fee just in case Delhivery API is down

    try {
      const originPin = "110095"; // Your warehouse PIN
      const actualWeight = Math.max(estimatedWeight, 500); 
      const delhiveryUrl = `${process.env.DELHIVERY_BASE_URL}/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${addressData.pinCode}&o_pin=${originPin}&cgm=${actualWeight}&pt=Pre-paid`;

      const response = await fetch(delhiveryUrl, {
        method: "GET",
        headers: {
          "Authorization": `Token ${process.env.DELHIVERY_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok && data[0]?.total_amount) {
        finalShippingFee = Math.ceil(data[0].total_amount);
      } else {
        console.error("Delhivery returned invalid pricing data, using fallback.");
      }
    } catch (shippingError) {
      console.error("Secure Shipping Calc Error:", shippingError);
    }

    // 3. Lock in the absolute final total
    const totalAmount = baseAmount + finalShippingFee;

    // 4. Create Order in Razorpay
    const options = {
      amount: totalAmount * 100, // Razorpay expects amounts in paise (multiply by 100)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);

    // 5. Handle Address securely
    let addressId = addressData.id;
    
    // If the frontend didn't pass an existing address ID, create a new one
    if (!addressId) {
      // Check if an identical physical address already exists for the user (case-insensitive and trimmed)
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: userId,
          street: { equals: addressData.street.trim(), mode: 'insensitive' },
          city: { equals: addressData.city.trim(), mode: 'insensitive' },
          state: { equals: addressData.state.trim(), mode: 'insensitive' },
          pinCode: { equals: addressData.pinCode.trim(), mode: 'insensitive' },
        }
      });

      if (existingAddress) {
        addressId = existingAddress.id;
        console.log("[Create Order] Found matching existing address ID:", addressId);
        
        // Update contact details on existing address
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: {
            firstName: addressData.firstName,
            lastName: addressData.lastName,
            phoneNumber: addressData.phoneNumber || existingAddress.phoneNumber,
            email: addressData.email,
          }
        });
      } else {
        const newAddress = await prisma.address.create({
          data: {
            userId: userId,
            firstName: addressData.firstName,
            lastName: addressData.lastName,
            phoneNumber: addressData.phoneNumber,
            email: addressData.email,
            street: addressData.street.trim(),
            city: addressData.city.trim(),
            state: addressData.state.trim(),
            pinCode: addressData.pinCode.trim(),
            country: "IN",
          }
        });
        addressId = newAddress.id;
        console.log("[Create Order] Created new address ID:", addressId);
      }
    }

    // 6. Draft the Order in your Database with price snapshot
    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        amount: totalAmount,
        status: "PENDING",
        paymentStatus: "PENDING",
        razorpayOrderId: razorpayOrder.id,
        addressId: addressId,
        // Snapshot the database prices on order creation
        items: {
          create: items.map((item: any) => {
            const vid = item.variant?.id || item.variantId;
            const dbVar = variantMap.get(vid)!;
            return {
              variantId: vid,
              quantity: item.quantity,
              price: dbVar.price
            };
          })
        }
      }
    });

    return NextResponse.json({ 
      orderId: razorpayOrder.id, 
      dbOrderId: newOrder.id,
      amount: razorpayOrder.amount 
    });


  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}