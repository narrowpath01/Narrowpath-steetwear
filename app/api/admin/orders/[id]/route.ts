import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/orders/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        address: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, title: true, handle: true, images: { take: 1 } },
                },
              },
            },
          },
        },
        returnRequest: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] - Update order status, shipping status, Delhivery AWB
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, shippingStatus, awb, trackingNumber } = body;

    const dataToUpdate: any = {};

    if (status !== undefined) {
      dataToUpdate.status = status;
      if (status === "DELIVERED") {
        dataToUpdate.deliveredAt = new Date();
      }
    }

    if (shippingStatus !== undefined) {
      dataToUpdate.shippingStatus = shippingStatus;
    }

    if (awb !== undefined) {
      dataToUpdate.awb = awb ? awb.trim() : null;
    }

    if (trackingNumber !== undefined) {
      dataToUpdate.trackingNumber = trackingNumber ? trackingNumber.trim() : null;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
