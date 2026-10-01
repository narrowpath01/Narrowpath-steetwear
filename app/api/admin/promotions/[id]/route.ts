import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/promotions/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { code, description, discountType, discountValue, minOrderAmount, isActive, startDate, endDate } = body;

    const existing = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    const cleanCode = code ? code.trim().toUpperCase().replace(/\s+/g, "") : existing.code;

    if (cleanCode !== existing.code) {
      const collision = await prisma.promotion.findUnique({
        where: { code: cleanCode },
      });
      if (collision && collision.id !== id) {
        return NextResponse.json({ error: "Promo code already in use." }, { status: 400 });
      }
    }

    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        code: cleanCode,
        description: description !== undefined ? description : existing.description,
        discountType: discountType || existing.discountType,
        discountValue: discountValue !== undefined ? Number(discountValue) : existing.discountValue,
        minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : existing.minOrderAmount,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
      },
    });

    return NextResponse.json({ success: true, promotion: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update promotion" }, { status: 500 });
  }
}

// PATCH /api/admin/promotions/[id] - Toggle isActive
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const promo = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promo) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    const updated = await prisma.promotion.update({
      where: { id },
      data: { isActive: !promo.isActive },
    });

    return NextResponse.json({ success: true, promotion: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to toggle promotion" }, { status: 500 });
  }
}

// DELETE /api/admin/promotions/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete promotion" }, { status: 500 });
  }
}
