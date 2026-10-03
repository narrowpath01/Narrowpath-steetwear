import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { createDelhiveryShipment } from "@/lib/delhivery";
import { sendOwnerWhatsAppNotification } from "@/lib/whatsapp";
import { sendOrderConfirmationEmails } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, dbOrderId } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // 1. Idempotency & existing order check
      const existingOrder = await prisma.order.findUnique({
        where: { id: dbOrderId },
        include: { items: true }
      });

      if (!existingOrder) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }

      if (existingOrder.status === "PAID" || existingOrder.paymentStatus === "PAID") {
        return NextResponse.json({ success: true, message: "Payment already verified" });
      }

      // 2. Mark the order as PAID and adjust inventory transactionally
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: dbOrderId },
          data: {
            status: "PAID",
            paymentStatus: "PAID",
            razorpayPaymentId: razorpay_payment_id,
          },
        });

        // Safely decrement variant inventory
        for (const item of existingOrder.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: {
              inventory: { decrement: item.quantity },
            },
          });
        }
      });

      // 3. Trigger Delhivery Manifest API call automatically (only if not already created)
      let awbNumber: string | null = existingOrder.awb || null;
      if (!awbNumber) {
        try {
          awbNumber = await createDelhiveryShipment(dbOrderId);
        } catch (shippingError) {
          console.error("Auto Delhivery Shipment Error (Prepaid):", shippingError);
          // We log the error but don't fail verification since payment succeeded
        }
      }

      // 2. Trigger WhatsApp notification to Store Owner
      try {
        await sendOwnerWhatsAppNotification(dbOrderId, awbNumber);
      } catch (ownerNotificationError) {
        console.error("Owner WhatsApp Notification Error:", ownerNotificationError);
      }

      // 3. Trigger Resend Email Notifications (Admin New Order + Customer Order Confirmation)
      try {
        await sendOrderConfirmationEmails(dbOrderId);
      } catch (emailNotificationError) {
        console.error("Resend Email Notification Error:", emailNotificationError);
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