import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

// PATCH /api/admin/inventory - Update variant inventory quantity
export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { variantId, inventory } = body;

    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required." }, { status: 400 });
    }

    const newInventory = Math.floor(Number(inventory));
    if (isNaN(newInventory) || newInventory < 0) {
      return NextResponse.json(
        { error: "Inventory must be a valid non-negative integer." },
        { status: 400 }
      );
    }

    const variant = await prisma.variant.update({
      where: { id: variantId },
      data: { inventory: newInventory },
      include: {
        product: {
          select: { title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      variantId: variant.id,
      newInventory: variant.inventory,
      productTitle: variant.product.title,
    });
  } catch (error: any) {
    console.error("Inventory update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update inventory" }, { status: 500 });
  }
}
