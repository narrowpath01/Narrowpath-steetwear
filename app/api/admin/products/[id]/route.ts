import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/products/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: {
          orderBy: { title: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { title, handle, description, collection, status, isFeatured, images, variants } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Sanitize handle
    const sanitizedHandle = (handle || title || existingProduct.handle)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if new handle conflicts with another product
    if (sanitizedHandle !== existingProduct.handle) {
      const duplicate = await prisma.product.findUnique({
        where: { handle: sanitizedHandle },
      });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: `Handle "${sanitizedHandle}" is already in use by another product.` },
          { status: 400 }
        );
      }
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one product variant is required." },
        { status: 400 }
      );
    }

    // Transactional update
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update core product fields
      await tx.product.update({
        where: { id },
        data: {
          title: title ? title.trim() : existingProduct.title,
          handle: sanitizedHandle,
          description: description !== undefined ? description : existingProduct.description,
          collection: collection || existingProduct.collection,
          status: status || existingProduct.status,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existingProduct.isFeatured,
        },
      });

      // 2. Sync Images: Delete old ones and re-insert if provided
      if (images && Array.isArray(images)) {
        await tx.image.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.image.createMany({
            data: images.map((img: { url: string; altText?: string }) => ({
              productId: id,
              url: img.url,
              altText: img.altText || title || existingProduct.title,
            })),
          });
        }
      }

      // 3. Sync Variants:
      // For each variant in payload, if it has an id that exists in current product, update it.
      // If it doesn't have an id, create it.
      // Any existing variant not in the incoming payload should be checked before deletion.
      const incomingIds = variants
        .map((v: any) => v.id)
        .filter(Boolean) as string[];

      // Delete variants not in incoming list (if not referenced by order items)
      const variantsToDelete = existingProduct.variants.filter(
        (v) => !incomingIds.includes(v.id)
      );

      for (const vDel of variantsToDelete) {
        const orderCount = await tx.orderItem.count({ where: { variantId: vDel.id } });
        if (orderCount > 0) {
          // Instead of hard deleting, we retain it with 0 stock to preserve order history
          await tx.variant.update({
            where: { id: vDel.id },
            data: { inventory: 0 },
          });
        } else {
          await tx.cartItem.deleteMany({ where: { variantId: vDel.id } });
          await tx.variant.delete({ where: { id: vDel.id } });
        }
      }

      // Update or create variants
      for (const v of variants) {
        if (v.id && existingProduct.variants.some((ev) => ev.id === v.id)) {
          await tx.variant.update({
            where: { id: v.id },
            data: {
              title: v.title.trim(),
              price: Number(v.price),
              sku: v.sku?.trim() || null,
              inventory: Math.floor(Number(v.inventory)),
            },
          });
        } else {
          await tx.variant.create({
            data: {
              productId: id,
              title: v.title.trim(),
              price: Number(v.price),
              sku: v.sku?.trim() || null,
              inventory: Math.floor(Number(v.inventory)),
            },
          });
        }
      }

      return await tx.product.findUnique({
        where: { id },
        include: { images: true, variants: { orderBy: { title: "asc" } } },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if any variant is tied to historical customer orders
    const variantIds = product.variants.map((v) => v.id);
    const orderItemsCount = await prisma.orderItem.count({
      where: { variantId: { in: variantIds } },
    });

    if (orderItemsCount > 0) {
      // Cannot hard-delete because historical customer orders depend on it
      // Automatically archive product instead to maintain data integrity
      await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: `Product is referenced in ${orderItemsCount} historical order(s). To preserve data integrity, it has been moved to ARCHIVED status instead of hard deletion.`,
      });
    }

    // Safe to delete completely
    await prisma.$transaction(async (tx) => {
      await tx.wishlistItem.deleteMany({ where: { productId: id } });
      await tx.image.deleteMany({ where: { productId: id } });
      await tx.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
      await tx.variant.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error("Admin product delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
