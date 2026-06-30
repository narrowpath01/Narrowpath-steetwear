import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createDelhiveryShipment } from "@/lib/delhivery";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const waybill = await createDelhiveryShipment(orderId);

        return NextResponse.json({ success: true, waybill: waybill }, { status: 200 });

    } catch (error: any) {
        console.error("Delhivery Creation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}