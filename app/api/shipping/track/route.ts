import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const waybill = searchParams.get("waybill");

    if (!waybill) return NextResponse.json({ error: "Waybill required" }, { status: 400 });

    const url = `https://track.delhivery.com/api/v1/packages/json/?waybill=${waybill}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.ShipmentData) {
      throw new Error("Tracking data unavailable");
    }

    const shipment = data.ShipmentData[0].Shipment;
    const scans = shipment.Scans.map((scan: any) => ({
      date: scan.ScanDetail.ScanDateTime,
      status: scan.ScanDetail.ScanType,
      location: scan.ScanDetail.ScannedLocation,
    }));

    // Synchronize DB order status with Delhivery status
    const lowerStatus = (shipment.Status.Status || "").toLowerCase();
    const lowerInstructions = (shipment.Status.Instructions || "").toLowerCase();
    const statusCode = (shipment.Status.StatusCode || "").toLowerCase();
    let dbStatus: string | null = null;
    let deliveredAt: Date | null = null;

    if (
      lowerStatus.includes("cancel") || 
      lowerStatus === "canc" || 
      lowerInstructions.includes("cancel") || 
      statusCode === "dtup-210"
    ) {
      dbStatus = "CANCELLED";
    } else if (lowerStatus === "delivered") {
      dbStatus = "DELIVERED";
      deliveredAt = new Date(shipment.Status.StatusDateTime || new Date());
    } else if (lowerStatus.includes("rto") || lowerStatus.includes("return") || lowerInstructions.includes("rto") || lowerInstructions.includes("return")) {
      dbStatus = "CANCELLED";
    } else if (lowerStatus === "in transit" || lowerStatus === "dispatched" || lowerStatus === "out for delivery" || lowerStatus === "picked up") {
      dbStatus = "SHIPPED";
    }

    if (dbStatus) {
      await prisma.order.updateMany({
        where: { awb: waybill },
        data: {
          status: dbStatus,
          ...(deliveredAt ? { deliveredAt } : {})
        }
      });
    }

    return NextResponse.json({
      waybill: shipment.AWB,
      currentStatus: shipment.Status.Status,
      instructions: shipment.Status.Instructions,
      statusCode: shipment.Status.StatusCode,
      expectedDelivery: shipment.ExpectedDeliveryDate,
      scans: scans
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tracking" }, { status: 500 });
  }
}