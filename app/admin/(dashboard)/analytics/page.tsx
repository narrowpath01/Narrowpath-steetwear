import React from "react";
import prisma from "@/lib/db";
import { AnalyticsClient } from "@/components/admin/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [orders, refundsAggregate, totalCustomers, customerOrderCounts, orderItems] =
    await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          amount: true,
          status: true,
          paymentStatus: true,
          shippingStatus: true,
          razorpayPaymentId: true,
          createdAt: true,
          deliveredAt: true,
        },
      }),
      prisma.refund.aggregate({
        where: { status: "PROCESSED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.user.count(),
      prisma.order.groupBy({
        by: ["userId"],
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      }),
      prisma.orderItem.findMany({
        select: {
          quantity: true,
          price: true,
          variant: {
            select: {
              product: {
                select: {
                  id: true,
                  title: true,
                  handle: true,
                  images: { take: 1, select: { url: true } },
                },
              },
            },
          },
        },
      }),
    ]);

  const totalRefundAmount = refundsAggregate._sum.amount || 0;
  const refundsCount = refundsAggregate._count || 0;

  const paidOrders = orders.filter(
    (o) =>
      o.paymentStatus === "PAID" ||
      ["CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "PARTIALLY_REFUNDED", "REFUNDED"].includes(o.status) ||
      !!o.razorpayPaymentId
  );

  const grossSales = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const netSales = Math.max(0, grossSales - totalRefundAmount);
  const aov = paidOrders.length > 0 ? grossSales / paidOrders.length : 0;

  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING" && !o.razorpayPaymentId).length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "DELIVERED" || o.shippingStatus === "DELIVERED").length;
  const shippedOrdersCount = orders.filter((o) => o.status === "SHIPPED" || o.shippingStatus === "In Transit").length;
  const ndrCount = orders.filter(
    (o) =>
      o.shippingStatus?.toUpperCase().includes("NDR") ||
      o.shippingStatus?.toUpperCase().includes("UNDELIVERED") ||
      o.status === "NDR"
  ).length;
  const rtoCount = orders.filter(
    (o) => o.shippingStatus?.toUpperCase().includes("RTO") || o.status === "RTO"
  ).length;
  const cancelledOrdersCount = orders.filter((o) => o.status === "CANCELLED").length;

  // Aggregate product performance
  const productMap = new Map<string, { id: string; title: string; handle: string; image: string; salesCount: number; revenue: number }>();
  for (const item of orderItems) {
    const prod = item.variant?.product;
    if (!prod) continue;
    const existing = productMap.get(prod.id) || {
      id: prod.id,
      title: prod.title,
      handle: prod.handle,
      image: prod.images[0]?.url || "/placeholder.png",
      salesCount: 0,
      revenue: 0,
    };
    existing.salesCount += item.quantity;
    existing.revenue += item.price * item.quantity;
    productMap.set(prod.id, existing);
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <AnalyticsClient
      data={{
        grossSales,
        netSales,
        totalRefundAmount,
        totalOrders: orders.length,
        paidOrdersCount: paidOrders.length,
        pendingOrdersCount,
        deliveredOrdersCount,
        shippedOrdersCount,
        ndrCount,
        rtoCount,
        cancelledOrdersCount,
        aov,
        totalCustomers,
        repeatCustomersCount: customerOrderCounts.length,
        topProducts,
        recentDailySales: [],
        refundsCount,
      }}
    />
  );
}
