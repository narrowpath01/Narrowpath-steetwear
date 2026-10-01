import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/blogs/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch blog" }, { status: 500 });
  }
}

// PUT /api/admin/blogs/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      authorName,
      status,
    } = body;

    const existing = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const cleanSlug = (slug || title || existing.slug)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    if (cleanSlug !== existing.slug) {
      const collision = await prisma.blog.findUnique({
        where: { slug: cleanSlug },
      });
      if (collision && collision.id !== id) {
        return NextResponse.json(
          { error: `Slug "${cleanSlug}" is already taken.` },
          { status: 400 }
        );
      }
    }

    const isPublishingNow = status === "PUBLISHED" && existing.status !== "PUBLISHED";

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title: title ? title.trim() : existing.title,
        slug: cleanSlug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
        category: category || existing.category,
        tags: tags !== undefined ? tags : existing.tags,
        authorName: authorName !== undefined ? authorName : existing.authorName,
        status: status || existing.status,
        publishedAt: isPublishingNow ? new Date() : existing.publishedAt,
      },
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error: any) {
    console.error("Admin blog update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

// DELETE /api/admin/blogs/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete blog" }, { status: 500 });
  }
}
