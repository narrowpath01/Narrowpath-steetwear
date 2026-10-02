import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import prisma from "@/lib/db";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// GET /api/admin/refunds - List all refunds with order and customer details
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const refunds = await prisma.refund.findMany({
      where: orderId ? { orderId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            user: {
              select: { name: true, email: true, phone: true },
            },
            address: {
              select: { firstName: true, lastName: true, email: true, phoneNumber: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ refunds });
  } catch (error: any) {
    console.error("Fetch refunds error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch refunds" }, { status: 500 });
  }
}

// POST /api/admin/refunds - Initiate a secure Razorpay refund
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { orderId, amount, reason, refundType } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch Order and verify eligibility
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        refunds: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: { select: { email: true, phoneNumber: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.razorpayPaymentId) {
      return NextResponse.json(
        { error: "This order cannot be refunded through Razorpay because no captured online payment ID was found." },
        { status: 400 }
      );
    }

    // 2. Calculate remaining refundable balance
    const successfulRefunds = order.refunds.filter((r) => r.status !== "FAILED");
    const totalAlreadyRefunded = successfulRefunds.reduce((acc, r) => acc + r.amount, 0);
    const remainingRefundable = Math.max(0, Math.round((order.amount - totalAlreadyRefunded) * 100) / 100);

    if (remainingRefundable <= 0) {
      return NextResponse.json(
        { error: "This order has already been fully refunded. Remaining refundable balance is ₹0." },
        { status: 400 }
      );
    }

    // Determine target refund amount
    let targetAmount = remainingRefundable;
    if (amount !== undefined && amount !== null && amount !== "") {
      const parsedAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ error: "Please provide a valid positive refund amount." }, { status: 400 });
      }
      targetAmount = Math.round(parsedAmount * 100) / 100;
    }

    if (targetAmount > remainingRefundable) {
      return NextResponse.json(
        {
          error: `Refund amount (₹${targetAmount}) exceeds remaining refundable balance of ₹${remainingRefundable}.`,
        },
        { status: 400 }
      );
    }

    // 3. Call Razorpay Refund API
    let rzpRefund: any;
    try {
      rzpRefund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(targetAmount * 100), // in paise
        speed: "normal",
        notes: {
          orderId: order.id,
          reason: reason ? String(reason).slice(0, 100) : "Admin customer refund",
          adminEmail: admin.user.email || "admin@narrowpath.in",
        },
      });
    } catch (rzpErr: any) {
      console.error("Razorpay refund API call failed:", rzpErr);
      const errMsg = rzpErr?.error?.description || rzpErr.message || "Razorpay refund initiation failed";

      // Log failure in AuditLog
      await prisma.auditLog.create({
        data: {
          adminEmail: admin.user.email || "admin",
          action: "ORDER_REFUND_FAILED",
          resourceType: "Order",
          resourceId: order.id,
          details: JSON.stringify({
            attemptedAmount: targetAmount,
            reason,
            error: errMsg,
          }),
        },
      });

      return NextResponse.json({ error: `Razorpay Error: ${errMsg}` }, { status: 502 });
    }

    // 4. Update Database Transactionally
    const newTotalRefunded = totalAlreadyRefunded + targetAmount;
    const isFullRefund = newTotalRefunded >= order.amount;
    const newStatus = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";

    const [createdRefund, updatedOrder] = await prisma.$transaction([
      prisma.refund.create({
        data: {
          orderId: order.id,
          razorpayPaymentId: order.razorpayPaymentId,
          razorpayRefundId: rzpRefund.id,
          amount: targetAmount,
          currency: "INR",
          reason: reason || (isFullRefund ? "Full customer refund" : "Partial customer refund"),
          status: "PROCESSED",
          adminEmail: admin.user.email || "admin",
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          paymentStatus: newStatus,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminEmail: admin.user.email || "admin",
          action: "ORDER_REFUND",
          resourceType: "Order",
          resourceId: order.id,
          details: JSON.stringify({
            refundId: rzpRefund.id,
            amount: targetAmount,
            refundType: isFullRefund ? "FULL" : "PARTIAL",
            reason,
            remainingAfterRefund: Math.max(0, order.amount - newTotalRefunded),
            previousStatus: order.status,
            newStatus,
          }),
        },
      }),
      prisma.notificationLog.create({
        data: {
          channel: "ADMIN",
          recipient: admin.user.email || "admin",
          event: "REFUND_PROCESSED",
          orderId: order.id,
          status: "SENT",
          providerMessageId: rzpRefund.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully processed refund of ₹${targetAmount.toLocaleString("en-IN")}.`,
      refund: createdRefund,
      order: updatedOrder,
      remainingRefundable: Math.max(0, order.amount - newTotalRefunded),
    });
  } catch (error: any) {
    console.error("Admin refund handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to process refund" }, { status: 500 });
  }
}
