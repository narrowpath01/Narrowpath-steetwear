import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

// GET /api/admin/promotions
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promotions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch promotions" }, { status: 500 });
  }
}

// POST /api/admin/promotions
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { code, description, discountType, discountValue, minOrderAmount, isActive, startDate, endDate } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Promotion / Coupon code is required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "");

    const existing = await prisma.promotion.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: `Promo code "${cleanCode}" already exists.` }, { status: 400 });
    }

    const val = Number(discountValue);
    if (isNaN(val) || val <= 0) {
      return NextResponse.json({ error: "Discount value must be greater than zero." }, { status: 400 });
    }

    const created = await prisma.promotion.create({
      data: {
        code: cleanCode,
        description: description?.trim() || null,
        discountType: discountType || "PERCENTAGE",
        discountValue: val,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, promotion: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create promotion" }, { status: 500 });
  }
}
