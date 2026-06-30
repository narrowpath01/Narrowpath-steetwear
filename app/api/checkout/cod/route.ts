import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createDelhiveryShipment } from "@/lib/delhivery";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, addressData } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // 1. Calculate Base Amount of the clothes
    const baseAmount = items.reduce((acc: number, item: any) => acc + (item.variant.price * item.quantity), 0);

    // 2. SECURE SHIPPING RECALCULATION FOR COD
    // Recalculating shipping directly with Delhivery API (using pt=COD for COD pricing)
    const estimatedWeight = items.reduce((acc: number, item: any) => acc + (500 * item.quantity), 0);
    let finalShippingFee = 100; // Fallback fee

    try {
      const originPin = "110095"; // Warehouse PIN
      const actualWeight = Math.max(estimatedWeight, 500); 
      const delhiveryUrl = `${process.env.DELHIVERY_BASE_URL}/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${addressData.pinCode}&o_pin=${originPin}&cgm=${actualWeight}&pt=COD`;

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
        console.error("Delhivery returned invalid pricing data for COD, using fallback.");
      }
    } catch (shippingError) {
      console.error("Secure COD Shipping Calc Error:", shippingError);
    }

    const totalAmount = baseAmount + finalShippingFee;

    // 3. Handle Address
    console.log("[COD Checkout] Incoming addressData:", addressData);
    let addressId = addressData.id;
    console.log("[COD Checkout] Initial addressId:", addressId);
    
    if (!addressId) {
      // Check if an identical address already exists for the user
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: session.user.id,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          pinCode: addressData.pinCode,
          phoneNumber: addressData.phoneNumber || null,
        }
      });

      if (existingAddress) {
        addressId = existingAddress.id;
        console.log("[COD Checkout] Found matching existing address ID:", addressId);
      } else {
        console.log("[COD Checkout] Creating new address record...");
        const newAddress = await prisma.address.create({
          data: {
            userId: session.user.id,
            firstName: addressData.firstName,
            lastName: addressData.lastName,
            phoneNumber: addressData.phoneNumber,
            email: addressData.email,
            street: addressData.street,
            city: addressData.city,
            state: addressData.state,
            pinCode: addressData.pinCode,
            country: "IN",
          }
        });
        addressId = newAddress.id;
        console.log("[COD Checkout] Created address ID:", addressId);
      }
    }

    console.log("[COD Checkout] Final addressId for order:", addressId);

    // 4. Create Order with status "COD_PENDING"
    const newOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        amount: totalAmount,
        status: "COD_PENDING",
        addressId: addressId,
        items: {
          create: items.map((item: any) => ({
            variantId: item.variant.id,
            quantity: item.quantity,
            price: item.variant.price
          }))
        }
      }
    });
    console.log("[COD Checkout] Created order in DB:", newOrder.id, "with addressId:", newOrder.addressId);

    // 5. Automatically manifest with Delhivery
    let waybill = null;
    try {
      waybill = await createDelhiveryShipment(newOrder.id);
    } catch (shippingError: any) {
      console.error("Delhivery Shipment Auto-manifestation failed for COD:", shippingError);
      // We return a success order but notify that manifesting has a warning (e.g. they need to create it manually later, or warehouse name issues)
    }

    // 6. Clear user's cart in database
    try {
      const userCart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
      });
      if (userCart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
      }
    } catch (cartError) {
      console.error("Failed to clear cart after successful COD order:", cartError);
    }

    return NextResponse.json({ 
      success: true,
      dbOrderId: newOrder.id,
      waybill: waybill
    });

  } catch (error: any) {
    console.error("COD Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Failed to place COD order" }, { status: 500 });
  }
}
