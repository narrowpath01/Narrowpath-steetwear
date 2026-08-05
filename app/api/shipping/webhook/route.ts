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
    const lowerStatus = (shipment.Status?.Status || "").toLowerCase();
    const lowerInstructions = (shipment.Status?.Instructions || "").toLowerCase();
    const statusCode = (shipment.Status?.StatusCode || "").toLowerCase();

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
      deliveredAt = new Date(shipment.Status?.StatusDateTime || new Date());
    } else if (
      lowerStatus.includes("rto") || 
      lowerStatus.includes("return") || 
      lowerInstructions.includes("rto") || 
      lowerInstructions.includes("return")
    ) {
      dbStatus = "CANCELLED";
    } else if (
      ["in transit", "dispatched", "out for delivery", "picked up"].includes(lowerStatus)
    ) {
      dbStatus = "SHIPPED";
    }

    if (dbStatus) {
      const updateResult = await prisma.order.updateMany({
        where: { awb: waybill },
        data: {
          status: dbStatus,
          ...(deliveredAt ? { deliveredAt } : {})
        }
      });
      console.log(`[Delhivery Webhook Sync]: Updated status to ${dbStatus} for waybill ${waybill}. Rows updated: ${updateResult.count}`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("[Delhivery Webhook Error]:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
