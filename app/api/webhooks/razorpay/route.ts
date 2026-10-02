import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { createDelhiveryShipment } from "@/lib/delhivery";
import { sendOwnerWhatsAppNotification } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const headerEventId = req.headers.get("x-razorpay-event-id");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
      console.error("[Razorpay Webhook Error]: Webhook secret not configured in environment");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("[Razorpay Webhook Warning]: Invalid signature verification failed");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const entityId = event?.payload?.payment?.entity?.id || event?.payload?.refund?.entity?.id;
    const eventId = headerEventId || event?.event_id || event?.id || (entityId ? `${event.event}_${entityId}` : `RAZORPAY_${Date.now()}`);
    const eventType = event?.event;

    // Idempotency check: Have we already processed this exact webhook event?
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      console.log(`[Razorpay Webhook]: Event ${eventId} was already processed. Skipping idempotently.`);
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    // Record webhook event for full audit traceability
    await prisma.webhookEvent.create({
      data: {
        eventId,
        provider: "RAZORPAY",
        eventType,
        payload: rawBody.slice(0, 4000), // safe snapshot
        processed: true,
      },
    });

    // Handle supported Razorpay events
    switch (eventType) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        const razorpayPaymentId = payment?.id;

        if (razorpayOrderId) {
          const order = await prisma.order.findUnique({
            where: { razorpayOrderId },
            include: { items: true },
          });

          if (order && order.paymentStatus !== "PAID") {
            // Update order and inventory transactionally
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: order.id },
                data: {
                  status: "PAID",
                  paymentStatus: "PAID",
                  razorpayPaymentId,
                },
              });

              for (const item of order.items) {
                await tx.variant.update({
                  where: { id: item.variantId },
                  data: {
                    inventory: { decrement: item.quantity },
                  },
                });
              }
            });

            // Trigger Delhivery shipment if not already manifested
            let awbNumber = order.awb;
            if (!awbNumber) {
              try {
                awbNumber = await createDelhiveryShipment(order.id);
              } catch (err) {
                console.error("[Razorpay Webhook]: Delhivery auto-manifest error:", err);
              }
            }

            // Notify store owner
            try {
              await sendOwnerWhatsAppNotification(order.id, awbNumber);
            } catch (err) {
              console.error("[Razorpay Webhook]: Owner notification error:", err);
            }
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        if (razorpayOrderId) {
          await prisma.order.updateMany({
            where: { razorpayOrderId, paymentStatus: { not: "PAID" } },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED",
            },
          });
        }
        break;
      }

      case "refund.processed": {
        const refund = event.payload?.refund?.entity;
        if (refund?.id) {
          await prisma.refund.updateMany({
            where: { razorpayRefundId: refund.id },
            data: { status: "PROCESSED" },
          });
        }
        break;
      }

      case "refund.failed": {
        const refund = event.payload?.refund?.entity;
        if (refund?.id) {
          await prisma.refund.updateMany({
            where: { razorpayRefundId: refund.id },
            data: { status: "FAILED" },
          });

          await prisma.auditLog.create({
            data: {
              action: "REFUND_WEBHOOK_FAILED",
              resourceType: "Refund",
              resourceId: refund.id,
              details: JSON.stringify(refund),
            },
          });
        }
        break;
      }

      default:
        console.log(`[Razorpay Webhook]: Unhandled event type ${eventType}`);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("[Razorpay Webhook Handler Error]:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
