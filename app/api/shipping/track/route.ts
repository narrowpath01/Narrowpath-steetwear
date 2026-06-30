import { NextResponse } from "next/server";

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

    return NextResponse.json({
      waybill: shipment.AWB,
      currentStatus: shipment.Status.Status,
      expectedDelivery: shipment.ExpectedDeliveryDate,
      scans: scans
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tracking" }, { status: 500 });
  }
}