import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/announcements/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { text, link, type, priority, isActive } = body;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        text: text ? text.trim() : undefined,
        link: link !== undefined ? link?.trim() || null : undefined,
        type: type || undefined,
        priority: priority !== undefined ? Number(priority) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update announcement" }, { status: 500 });
  }
}

// PATCH /api/admin/announcements/[id] - Toggle isActive
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { isActive: !announcement.isActive },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to toggle announcement" }, { status: 500 });
  }
}

// DELETE /api/admin/announcements/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete announcement" }, { status: 500 });
  }
}
