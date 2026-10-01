import React from "react";
import { requireAdmin } from "@/lib/auth-admin";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Narrow Path — Operations Console",
  description: "Executive e-commerce administration and inventory management system.",
  robots: "noindex, nofollow",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return <AdminShell user={user}>{children}</AdminShell>;
}
