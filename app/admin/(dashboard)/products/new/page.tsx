import React from "react";
import prisma from "@/lib/db";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return <ProductEditor categories={categories} />;
}
