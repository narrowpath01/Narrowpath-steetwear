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
    const body = await req.json();
    const { status } = body;

    if (!["ACTIVE", "DRAFT", "ARCHIVED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}
