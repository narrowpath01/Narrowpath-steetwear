import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

// GET /api/admin/announcements
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch announcements" }, { status: 500 });
  }
}

// POST /api/admin/announcements
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { text, link, type, priority, isActive } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Announcement text is required." }, { status: 400 });
    }

    const created = await prisma.announcement.create({
      data: {
        text: text.trim(),
        link: link?.trim() || null,
        type: type || "MARQUEE",
        priority: Number(priority) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, announcement: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create announcement" }, { status: 500 });
  }
}
