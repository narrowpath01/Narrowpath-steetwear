import React from "react";
import prisma from "@/lib/db";
import { CategoryManagerClient } from "@/components/admin/CategoryManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const categoriesWithCount = await Promise.all(
    categories.map(async (c) => {
      const productCount = await prisma.product.count({
        where: {
          OR: [{ collection: c.name }, { collection: c.slug }],
        },
      });
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        isActive: c.isActive,
        productCount,
      };
    })
  );

  return <CategoryManagerClient initialCategories={categoriesWithCount} />;
}
