import React from "react";
import prisma from "@/lib/db";
import { InventoryManagerClient } from "@/components/admin/InventoryManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const variants = await prisma.variant.findMany({
    include: {
      product: {
        select: {
          id: true,
          title: true,
          handle: true,
          collection: true,
          updatedAt: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      },
    },
    orderBy: [
      { inventory: "asc" },
      { product: { title: "asc" } },
    ],
  });

  return <InventoryManagerClient initialVariants={variants} />;
}
