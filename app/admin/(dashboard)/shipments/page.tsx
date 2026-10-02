import React from "react";
import prisma from "@/lib/db";
import { ShipmentsClient } from "@/components/admin/ShipmentsClient";

export const dynamic = "force-dynamic";

export default async function AdminShipmentsPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
      address: {
        select: {
          firstName: true,
          lastName: true,
          street: true,
          city: true,
          state: true,
          pinCode: true,
          phoneNumber: true,
        },
      },
      items: {
        select: { id: true, quantity: true },
      },
    },
  });

  return (
    <ShipmentsClient
      initialOrders={orders.map((o) => ({
        id: o.id,
        amount: o.amount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        shippingStatus: o.shippingStatus,
        awb: o.awb,
        trackingNumber: o.trackingNumber,
        createdAt: o.createdAt,
        deliveredAt: o.deliveredAt,
        user: o.user,
        address: o.address,
        items: o.items,
      }))}
    />
  );
}
