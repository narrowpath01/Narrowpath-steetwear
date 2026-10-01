import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/categories/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, slug, description, image, isActive } = body;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const cleanSlug = (slug || name || existing.slug)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    // Check slug collision
    if (cleanSlug !== existing.slug) {
      const collision = await prisma.category.findUnique({
        where: { slug: cleanSlug },
      });
      if (collision && collision.id !== id) {
        return NextResponse.json({ error: "Slug is already used by another category." }, { status: 400 });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        slug: cleanSlug,
        description: description !== undefined ? description : existing.description,
        image: image !== undefined ? image : existing.image,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Safety check: Does any product belong to this category/collection?
    const productCount = await prisma.product.count({
      where: {
        OR: [
          { collection: category.name },
          { collection: category.slug },
        ],
      },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${productCount} product(s) currently belong to "${category.name}". Reassign or delete those products first to maintain catalog integrity.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
