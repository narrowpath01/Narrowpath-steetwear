import React from "react";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/admin/OrderDetailClient";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      address: true,
      items: {
        include: {
          variant: {
            include: {
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
      returnRequest: true,
      refunds: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailClient
      initialOrder={{
        id: order.id,
        amount: order.amount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        awb: order.awb,
        trackingNumber: order.trackingNumber,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        user: order.user,
        address: order.address,
        refunds: order.refunds.map((r) => ({
          id: r.id,
          razorpayRefundId: r.razorpayRefundId,
          amount: r.amount,
          status: r.status,
          reason: r.reason,
          adminEmail: r.adminEmail,
          createdAt: r.createdAt,
        })),
        items: order.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          price: i.price,
          variant: {
            id: i.variant.id,
            title: i.variant.title,
            sku: i.variant.sku,
            product: {
              id: i.variant.product.id,
              title: i.variant.product.title,
              handle: i.variant.product.handle,
              images: i.variant.product.images,
            },
          },
        })),
        returnRequest: order.returnRequest,
      }}
    />
  );
}
