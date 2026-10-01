import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isFeatured: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured },
    });

    return NextResponse.json({ success: true, isFeatured: updated.isFeatured });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to toggle featured status" }, { status: 500 });
  }
}
