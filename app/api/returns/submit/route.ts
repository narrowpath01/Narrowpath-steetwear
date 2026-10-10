import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendOwnerWhatsAppReturnRequest } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, reason, type, isDefective, mediaUrl } = await req.json();

    if (!mediaUrl) {
      return NextResponse.json({ error: "Claims submitted without sufficient supporting evidence may not qualify. Photo/Video required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        returnRequest: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid order or unauthorized access." }, { status: 400 });
    }

    if (order.returnRequest) {
      return NextResponse.json(
        { error: "A return or exchange claim has already been submitted for this order." },
        { status: 400 }
      );
    }

    // CHECK IF ORDER HAS ONLY CUSTOMIZED ITEMS (STRICTLY NON-RETURNABLE)
    const isCustomItem = (item: any) => {
      const prod = item.variant?.product;
      return (
        prod?.collection?.toUpperCase() === "CUSTOM" ||
        prod?.handle?.toLowerCase().startsWith("custom") ||
        prod?.title?.toLowerCase().includes("custom") ||
        item.variant?.title?.toLowerCase().includes("custom")
      );
    };

    const hasOnlyCustomItems = order.items && order.items.length > 0 && order.items.every(isCustomItem);
    if (hasOnlyCustomItems) {
      return NextResponse.json(
        {
          error: "Customized orders are personalized exclusively to customer specifications (size and graphics) and are strictly non-returnable and non-exchangeable per store policy.",
        },
        { status: 400 }
      );
    }

    // ENFORCE DELIVERY WINDOW (5 DAYS FOR EXCHANGE, 7 DAYS FOR REFUND)
    if (order.deliveredAt) {
      const daysSinceDelivery = (new Date().getTime() - new Date(order.deliveredAt).getTime()) / (1000 * 3600 * 24);
      const maxDays = type === "REFUND" ? 7 : 5;
      if (daysSinceDelivery > maxDays) {
        return NextResponse.json(
          { error: `The ${type === "REFUND" ? "Refund" : "Exchange"} window has expired (${maxDays} days max from delivery).` },
          { status: 403 }
        );
      }
    }

    const returnReq = await prisma.returnRequest.create({
      data: {
        orderId,
        reason: String(reason || "").trim(),
        type: type === "REFUND" ? "REFUND" : "EXCHANGE",
        isDefective: Boolean(isDefective),
        mediaUrl: String(mediaUrl || "N/A").trim(),
        status: "PENDING_REVIEW"
      }
    });

    // Notify the owner of the new return request
    try {
      await sendOwnerWhatsAppReturnRequest(orderId);
    } catch (notifErr) {
      console.warn("[WhatsApp Return Notification Warn]:", notifErr);
    }

    return NextResponse.json({ success: true, returnId: returnReq.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}