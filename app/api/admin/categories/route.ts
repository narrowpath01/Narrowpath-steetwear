import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

// GET /api/admin/categories - List categories with associated product counts
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    // Compute products count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const productCount = await prisma.product.count({
          where: {
            OR: [
              { collection: c.name },
              { collection: c.slug },
            ],
          },
        });
        return { ...c, productCount };
      })
    );

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/admin/categories - Create category
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, image, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: cleanSlug }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "A category with this name or slug already exists." }, { status: 400 });
    }

    const created = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        image: image || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, category: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
