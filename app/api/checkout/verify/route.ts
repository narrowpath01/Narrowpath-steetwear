import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { createDelhiveryShipment } from "@/lib/delhivery";
import { sendOwnerWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, dbOrderId } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // 1. Signature is legit. Mark the order as PAID.
      await prisma.order.update({
        where: { id: dbOrderId },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      // 1.5. Trigger Delhivery Manifest API call automatically
      let awbNumber: string | null = null;
      try {
        awbNumber = await createDelhiveryShipment(dbOrderId);
      } catch (shippingError) {
        console.error("Auto Delhivery Shipment Error (Prepaid):", shippingError);
        // We log the error but don't fail the verification since the payment was already successful.
      }

      // 2. Trigger WhatsApp notification to Store Owner
      try {
        await sendOwnerWhatsAppNotification(dbOrderId, awbNumber);
      } catch (ownerNotificationError) {
        console.error("Owner WhatsApp Notification Error:", ownerNotificationError);
      }

      // 3. Clear user's cart in database
      try {
        const order = await prisma.order.findUnique({
          where: { id: dbOrderId },
          select: { userId: true },
        });
        if (order?.userId) {
          const userCart = await prisma.cart.findUnique({
            where: { userId: order.userId },
          });
          if (userCart) {
            await prisma.cartItem.deleteMany({
              where: { cartId: userCart.id }
            });
          }
        }
      } catch (cartError) {
        console.error("Failed to clear cart after successful order:", cartError);
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}