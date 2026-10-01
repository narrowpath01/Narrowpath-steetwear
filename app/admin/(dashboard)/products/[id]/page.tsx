import React from "react";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: {
          orderBy: { title: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductEditor
      initialProduct={{
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        collection: product.collection,
        status: product.status,
        isFeatured: product.isFeatured,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || "",
        })),
        variants: product.variants.map((v) => ({
          id: v.id,
          title: v.title,
          price: v.price,
          sku: v.sku || "",
          inventory: v.inventory,
        })),
      }}
      categories={categories}
    />
  );
}
