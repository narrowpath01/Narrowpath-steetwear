import React from "react";
import prisma from "@/lib/db";
import { PromotionManagerClient } from "@/components/admin/PromotionManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PromotionManagerClient initialPromotions={promotions} />;
}
