import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, reason, type, isDefective, mediaUrl } = await req.json();

    if (!mediaUrl) {
      return NextResponse.json({ error: "Claims submitted without sufficient supporting evidence may not qualify. Photo/Video required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    // ENFORCE THE 3-DAY RULE
    if (order.deliveredAt) {
      const daysSinceDelivery = (new Date().getTime() - new Date(order.deliveredAt).getTime()) / (1000 * 3600 * 24);
      if (daysSinceDelivery > 3) {
        return NextResponse.json({ error: "Exchange/Refund window has expired (5 days max)." }, { status: 403 });
      }
    }

    const returnReq = await prisma.returnRequest.create({
      data: {
        orderId,
        reason,
        type,
        isDefective,
        mediaUrl, // The URL from AWS S3 or UploadThing
        status: "PENDING_REVIEW"
      }
    });

    return NextResponse.json({ success: true, returnId: returnReq.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}