import React from "react";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, OrdersIcon, EyeIcon } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              variant: {
                select: {
                  title: true,
                  product: { select: { title: true } },
                },
              },
            },
          },
        },
      },
      addresses: true,
    },
  });

  if (!customer) {
    notFound();
  }

  const lifetimeSpend = customer.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((acc, o) => acc + o.amount, 0);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
        <Link
          href="/admin/customers"
          className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300 transition shadow-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
              {customer.name || "Customer Account"}
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                customer.role === "ADMIN"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-neutral-100 text-neutral-700 border-neutral-200"
              }`}
            >
              {customer.role}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
            Customer ID: {customer.id}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Orders Placed</span>
          <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {customer.orders.length}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Cumulative Spend</span>
          <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            ₹{lifetimeSpend.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Saved Addresses</span>
          <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {customer.addresses.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Orders History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <OrdersIcon className="w-4 h-4 text-neutral-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Purchase History ({customer.orders.length})
              </h2>
            </div>

            {customer.orders.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">
                This customer has not placed any orders yet.
              </p>
            ) : (
              <div className="divide-y divide-neutral-200">
                {customer.orders.map((o) => {
                  const statusColor =
                    o.status === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : o.status === "CANCELLED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";

                  return (
                    <div
                      key={o.id}
                      className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-mono text-xs font-bold text-neutral-900 hover:underline"
                          >
                            #{o.id.slice(0, 8)}
                          </Link>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded border ${statusColor}`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          • {o.items.length} item(s)
                        </p>
                        <p className="text-[11px] text-neutral-600 mt-0.5 truncate max-w-md">
                          {o.items.map((i) => `${i.variant?.product?.title} (${i.variant?.title}) × ${i.quantity}`).join(", ")}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div>
                          <span className="font-mono font-bold text-xs text-neutral-900 block">
                            ₹{o.amount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase block font-medium">
                            {o.shippingStatus}
                          </span>
                        </div>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 transition shadow-sm"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Profile & Addresses */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Account Information
            </h2>
            <div>
              <span className="text-neutral-500 text-[11px] block">Email</span>
              <span className="text-neutral-900 font-medium">{customer.email || "Not specified"}</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[11px] block">Verified Phone</span>
              <span className="text-neutral-900 font-mono font-medium">
                {customer.phone ? `+91 ${customer.phone}` : "Not linked"}
              </span>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Shipping Destinations ({customer.addresses.length})
            </h2>

            {customer.addresses.length === 0 ? (
              <p className="text-neutral-500 italic">No addresses saved.</p>
            ) : (
              <div className="space-y-3">
                {customer.addresses.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 leading-relaxed"
                  >
                    <p className="font-semibold text-neutral-900">
                      {a.firstName} {a.lastName}
                    </p>
                    <p className="mt-0.5">{a.street}</p>
                    <p>
                      {a.city}, {a.state} — {a.pinCode}
                    </p>
                    {a.phoneNumber && (
                      <p className="font-mono text-[11px] text-neutral-600 mt-1">
                        +91 {a.phoneNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
