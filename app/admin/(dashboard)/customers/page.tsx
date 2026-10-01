import React from "react";
import prisma from "@/lib/db";
import { CustomerListClient } from "@/components/admin/CustomerListClient";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      orders: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
      addresses: {
        select: {
          id: true,
          city: true,
          state: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return <CustomerListClient initialCustomers={users} />;
}
