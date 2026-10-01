import React from "react";
import prisma from "@/lib/db";
import { ProductListClient } from "@/components/admin/ProductListClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        images: true,
        variants: {
          orderBy: { title: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Extract distinct collection names
  const productCollections = Array.from(new Set(products.map((p) => p.collection)));
  const categoryNames = categories.map((c) => c.name);
  const allCollections = Array.from(new Set([...productCollections, ...categoryNames])).filter(Boolean);

  return (
    <ProductListClient
      initialProducts={products}
      collections={allCollections}
    />
  );
}
