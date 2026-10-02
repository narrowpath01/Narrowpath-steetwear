import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("[Delhivery Webhook Received]:", JSON.stringify(data, null, 2));

    // Handle single shipment payload or list payload
    const shipment = data?.Shipment || data?.[0]?.Shipment;

    if (!shipment || !shipment.AWB) {
      return NextResponse.json({ error: "Invalid payload: AWB is required" }, { status: 400 });
    }

    const waybill = shipment.AWB;
    const rawStatus = shipment.Status?.Status || "";
    const lowerStatus = rawStatus.toLowerCase();
    const lowerInstructions = (shipment.Status?.Instructions || "").toLowerCase();
    const statusCode = (shipment.Status?.StatusCode || "").toLowerCase();
    const statusDateTime = shipment.Status?.StatusDateTime || new Date().toISOString();

    // Idempotency verification via WebhookEvent
    const eventId = `DELHIVERY_${waybill}_${statusCode || rawStatus}_${statusDateTime}`;
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent) {
      return NextResponse.json({ success: true, message: "Webhook already processed" });
    }

    let dbStatus: string | null = null;
    let deliveredAt: Date | null = null;

    // Synchronize DB status with Delhivery webhook update
    if (
      lowerStatus.includes("cancel") || 
      lowerStatus === "canc" || 
      lowerInstructions.includes("cancel") || 
      statusCode === "dtup-210"
    ) {
      dbStatus = "CANCELLED";
    } else if (lowerStatus === "delivered") {
      dbStatus = "DELIVERED";
      deliveredAt = new Date(statusDateTime);
    } else if (
      lowerStatus.includes("rto") || 
      lowerInstructions.includes("rto")
    ) {
      dbStatus = "RTO";
    } else if (
      lowerStatus.includes("undelivered") ||
      lowerStatus.includes("ndr") ||
      lowerInstructions.includes("customer not available") ||
      lowerInstructions.includes("address incomplete") ||
      lowerInstructions.includes("rejected by customer")
    ) {
      dbStatus = "NDR";
    } else if (
      ["in transit", "dispatched", "out for delivery", "picked up", "manifested"].includes(lowerStatus)
    ) {
      dbStatus = "SHIPPED";
    }

    await prisma.$transaction(async (tx) => {
      // Record webhook event for idempotency
      await tx.webhookEvent.create({
        data: {
          eventId,
          provider: "DELHIVERY",
          eventType: rawStatus || "STATUS_UPDATE",
          payload: JSON.stringify(data),
          processed: true,
        },
      });

      if (dbStatus) {
        await tx.order.updateMany({
          where: { awb: waybill },
          data: {
            ...(dbStatus !== "NDR" ? { status: dbStatus } : {}), // Keep status or tag NDR in shippingStatus
            shippingStatus: rawStatus || dbStatus,
            ...(deliveredAt ? { deliveredAt } : {}),
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: "Webhook processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("[Delhivery Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to process webhook" }, { status: 500 });
  }
}
