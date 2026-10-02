import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";
import { createDelhiveryShipment } from "@/lib/delhivery";

export async function POST(req: Request) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, awb: true, status: true, paymentStatus: true, razorpayPaymentId: true },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Idempotency: If order already has an assigned waybill, do not duplicate
        if (order.awb) {
            return NextResponse.json({
                success: true,
                waybill: order.awb,
                message: "Shipment already manifested in Delhivery",
            }, { status: 200 });
        }

        const waybill = await createDelhiveryShipment(orderId);

        // Record in AuditLog
        await prisma.auditLog.create({
            data: {
                adminEmail: admin.user.email || admin.user.phone || "Admin",
                action: "SHIPMENT_CREATED",
                resourceType: "Order",
                resourceId: orderId,
                details: `Delhivery shipment manifested with AWB ${waybill}`,
            },
        });

        return NextResponse.json({ success: true, waybill: waybill }, { status: 200 });

    } catch (error: any) {
        console.error("Delhivery Creation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}