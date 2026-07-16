import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendCustomerWhatsAppCancellation, sendOwnerWhatsAppCancellation } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
    }

    // Check cancellation window (15 minutes)
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const diffInMinutes = (currentTime - orderTime) / (1000 * 60);

    if (diffInMinutes > 15) {
      return NextResponse.json({
        error: "Cancellations are only allowed within 15 minutes of placing an order."
      }, { status: 400 });
    }

    // Check order status
    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "This order has already been cancelled." }, { status: 400 });
    }

    if (order.status !== "PAID" && order.status !== "PENDING") {
      return NextResponse.json({
        error: "This order cannot be cancelled as it is already being processed or shipped."
      }, { status: 400 });
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    });

    // Trigger customer and owner cancellation alerts
    try {
      await sendCustomerWhatsAppCancellation(orderId);
      await sendOwnerWhatsAppCancellation(orderId);
    } catch (notifError) {
      console.error("Failed to send cancellation WhatsApp alerts:", notifError);
    }

    return NextResponse.json({ success: true, message: "Order cancelled successfully", order: updatedOrder });
  } catch (error) {
    console.error("Order Cancellation Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
