import React from "react";
import prisma from "@/lib/db";
import { OrderListClient } from "@/components/admin/OrderListClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
      address: {
        select: { city: true, state: true },
      },
      items: {
        select: { id: true, quantity: true, price: true },
      },
    },
  });

  return <OrderListClient initialOrders={orders} />;
}
