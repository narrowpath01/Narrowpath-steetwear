import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

// GET /api/admin/blogs - List blog posts with filters
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("query")?.trim() || "";
  const status = searchParams.get("status") || "ALL";

  try {
    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ blogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch blogs" }, { status: 500 });
  }
}

// POST /api/admin/blogs - Create blog post
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Blog title is required." }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Blog content is required." }, { status: 400 });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const existing = await prisma.blog.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `An article with slug "${cleanSlug}" already exists.` },
        { status: 400 }
      );
    }

    const isPublishing = status === "PUBLISHED";

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        featuredImage: featuredImage || null,
        category: category || "Editorial",
        tags: tags?.trim() || null,
        authorName: authorName?.trim() || admin.user.name || "Narrow Path Team",
        status: status || "DRAFT",
        publishedAt: isPublishing ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error: any) {
    console.error("Admin blog creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create blog" }, { status: 500 });
  }
}
