import React from "react";
import prisma from "@/lib/db";
import { ReturnsClient } from "@/components/admin/ReturnsClient";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          id: true,
          amount: true,
          status: true,
          paymentStatus: true,
          shippingStatus: true,
          razorpayPaymentId: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          address: {
            select: { firstName: true, lastName: true, city: true, state: true, pinCode: true },
          },
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  title: true,
                  sku: true,
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
          },
        },
      },
    },
  });

  return (
    <ReturnsClient
      initialReturns={returns.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        reason: r.reason,
        type: r.type,
        isDefective: r.isDefective,
        mediaUrl: r.mediaUrl,
        status: r.status,
        adminNotes: r.adminNotes,
        createdAt: r.createdAt,
        order: {
          id: r.order.id,
          amount: r.order.amount,
          status: r.order.status,
          paymentStatus: r.order.paymentStatus,
          shippingStatus: r.order.shippingStatus,
          razorpayPaymentId: r.order.razorpayPaymentId,
          createdAt: r.order.createdAt,
          user: r.order.user,
          address: r.order.address,
          items: r.order.items.map((it) => ({
            id: it.id,
            quantity: it.quantity,
            price: it.price,
            variant: {
              id: it.variant.id,
              title: it.variant.title,
              sku: it.variant.sku,
              product: {
                id: it.variant.product.id,
                title: it.variant.product.title,
                handle: it.variant.product.handle,
                images: it.variant.product.images,
              },
            },
          })),
        },
      }))}
    />
  );
}
