import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

// GET /api/admin/products - List products with query, status, collection filters
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin clearance required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || "";
  const status = searchParams.get("status") || "ALL";
  const collection = searchParams.get("collection") || "ALL";

  try {
    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (collection !== "ALL") {
      whereClause.collection = collection;
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { handle: { contains: query, mode: "insensitive" } },
        {
          variants: {
            some: {
              sku: { contains: query, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        variants: {
          orderBy: { title: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/admin/products - Create a new product with images & variants
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin clearance required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, handle, description, collection, status, isFeatured, images, variants } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    // Auto-generate or sanitize handle (slug)
    const sanitizedHandle = (handle || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!sanitizedHandle) {
      return NextResponse.json({ error: "Valid product handle/slug is required." }, { status: 400 });
    }

    // Check unique handle
    const existing = await prisma.product.findUnique({
      where: { handle: sanitizedHandle },
    });
    if (existing) {
      return NextResponse.json(
        { error: `A product with handle "${sanitizedHandle}" already exists.` },
        { status: 400 }
      );
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one product variant (size/price/inventory) is required." },
        { status: 400 }
      );
    }

    for (const v of variants) {
      if (!v.title || !v.title.trim()) {
        return NextResponse.json({ error: "Each variant must have a title (e.g. Size 'M')." }, { status: 400 });
      }
      if (typeof v.price !== "number" || v.price < 0) {
        return NextResponse.json({ error: "Variant price must be a non-negative number." }, { status: 400 });
      }
      if (typeof v.inventory !== "number" || v.inventory < 0) {
        return NextResponse.json({ error: "Variant inventory must be a non-negative integer." }, { status: 400 });
      }
    }

    // Create in a transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title: title.trim(),
          handle: sanitizedHandle,
          description: description || "",
          collection: collection || "PRINTED",
          status: status || "ACTIVE",
          isFeatured: Boolean(isFeatured),
        },
      });

      // Insert images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        await tx.image.createMany({
          data: images.map((img: { url: string; altText?: string }) => ({
            productId: product.id,
            url: img.url,
            altText: img.altText || product.title,
          })),
        });
      }

      // Insert variants
      await tx.variant.createMany({
        data: variants.map((v: { title: string; price: number; sku?: string; inventory: number }) => ({
          productId: product.id,
          title: v.title.trim(),
          price: Number(v.price),
          sku: v.sku?.trim() || null,
          inventory: Math.floor(Number(v.inventory)),
        })),
      });

      return await tx.product.findUnique({
        where: { id: product.id },
        include: { images: true, variants: true },
      });
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Admin product creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
