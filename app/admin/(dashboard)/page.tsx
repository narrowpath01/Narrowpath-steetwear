import React from "react";
import Link from "next/link";
import prisma from "@/lib/db";
import {
  ProductsIcon,
  OrdersIcon,
  CustomersIcon,
  InventoryIcon,
  BlogIcon,
  PlusIcon,
  AlertCircleIcon,
  PackageIcon,
  MegaphoneIcon,
  DollarIcon,
  TruckIcon,
  TrendingUpIcon,
} from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Parallel database queries
  const [
    totalProducts,
    activeProducts,
    lowStockVariantsCount,
    outOfStockCount,
    totalOrdersCount,
    pendingPaymentsCount,
    shippedOrdersCount,
    deliveredOrdersCount,
    totalCustomers,
    publishedBlogs,
    activeAnnouncement,
    paidOrders,
    allOrdersToday,
    refundsAggregate,
    pendingReturnsCount,
    pendingShipmentCount,
    recentProducts,
    recentRefunds,
    lowStockItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.variant.count({ where: { inventory: { lte: 5, gt: 0 } } }),
    prisma.variant.count({ where: { inventory: 0 } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING", razorpayPaymentId: null } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.user.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { paymentStatus: "PAID" },
          { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "PARTIALLY_REFUNDED", "REFUNDED"] } },
          { razorpayPaymentId: { not: null } },
        ],
      },
      select: { amount: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { amount: true, razorpayPaymentId: true, status: true },
    }),
    prisma.refund.aggregate({
      where: { status: "PROCESSED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.returnRequest.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.order.count({
      where: {
        awb: null,
        status: { in: ["CONFIRMED", "PAID"] },
      },
    }),
    prisma.product.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        images: { take: 1 },
        variants: true,
      },
    }),
    prisma.refund.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { id: true, user: { select: { name: true } } } },
      },
    }),
    prisma.variant.findMany({
      where: { inventory: { lte: 5 } },
      take: 6,
      orderBy: { inventory: "asc" },
      include: {
        product: {
          include: {
            images: { take: 1 },
          },
        },
      },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalRefundAmount = refundsAggregate._sum.amount || 0;
  const netRevenue = Math.max(0, totalRevenue - totalRefundAmount);

  const todayPaidOrders = allOrdersToday.filter(
    (o) => !!o.razorpayPaymentId || ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(o.status)
  );
  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header and Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-mono">
            Operations Center
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time commercial metrics, Razorpay settlements, Delhivery fulfillment, and catalog health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/shipments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 text-neutral-700 hover:text-black hover:border-neutral-400 text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <TruckIcon className="w-4 h-4" />
            <span>Delhivery Shipments</span>
          </Link>
          <Link
            href="/admin/returns"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 text-neutral-700 hover:text-black hover:border-neutral-400 text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <AlertCircleIcon className="w-4 h-4 text-amber-600" />
            <span>Returns ({pendingReturnsCount})</span>
          </Link>
        </div>
      </div>

      {/* Active Announcement Banner if any */}
      {activeAnnouncement && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
              <MegaphoneIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                  Active Store Announcement ({activeAnnouncement.type})
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-neutral-800 font-semibold mt-0.5">
                {activeAnnouncement.text}
              </p>
            </div>
          </div>
          <Link
            href="/admin/announcements"
            className="text-xs text-amber-800 hover:text-black font-semibold shrink-0 underline underline-offset-4"
          >
            Manage
          </Link>
        </div>
      )}

      {/* Primary Financial & Operational Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today Revenue */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Today's Revenue</span>
            <DollarIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
              ₹{todayRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[11px] text-neutral-600 mt-2 font-mono">
            {todayPaidOrders.length} paid orders today
          </p>
        </div>

        {/* Net Realized Revenue */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Net Realized Revenue</span>
            <TrendingUpIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 font-mono">
              ₹{netRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Gross ₹{totalRevenue.toLocaleString("en-IN")} • Refunds ₹{totalRefundAmount.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Total Orders Volume */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Orders</span>
            <OrdersIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
              {totalOrdersCount}
            </span>
            <span className="text-xs text-neutral-400 font-mono">({paidOrders.length} paid)</span>
          </div>
          <p className="text-[11px] text-neutral-600 mt-2">
            <span className="text-emerald-600 font-semibold">{deliveredOrdersCount} Delivered</span>{" "}
            • <span className="text-blue-600 font-semibold">{shippedOrdersCount} In Transit</span>
          </p>
        </div>

        {/* Inventory & Out of Stock */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Inventory Health</span>
            <InventoryIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight font-mono ${
                outOfStockCount > 0 ? "text-red-600" : lowStockVariantsCount > 0 ? "text-amber-600" : "text-neutral-900"
              }`}
            >
              {lowStockVariantsCount + outOfStockCount}
            </span>
            <span className="text-xs text-neutral-400">alerts</span>
          </div>
          <p className="text-[11px] text-neutral-600 mt-2 font-mono">
            {outOfStockCount > 0 && <span className="text-red-600 font-bold">{outOfStockCount} Out of Stock • </span>}
            {lowStockVariantsCount} Low Stock
          </p>
        </div>
      </div>

      {/* Secondary Operational Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Delhivery Dispatch Pipeline */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
              Delhivery Dispatch Pipeline
            </p>
            <p className="text-lg font-bold text-neutral-900 mt-1 font-mono">
              {pendingShipmentCount} Orders Need Manifesting
            </p>
            <Link
              href="/admin/shipments"
              className="text-[11px] text-blue-600 hover:underline font-semibold mt-0.5 inline-block"
            >
              View Delhivery Manifests →
            </Link>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <TruckIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Customer Return Claims */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
              Returns & Claims
            </p>
            <p className="text-lg font-bold text-neutral-900 mt-1 font-mono">
              {pendingReturnsCount} Claims Pending Review
            </p>
            <Link
              href="/admin/returns"
              className="text-[11px] text-amber-700 hover:underline font-semibold mt-0.5 inline-block"
            >
              Adjudicate Returns →
            </Link>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <AlertCircleIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Online Payment Health */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
              Razorpay Settlement
            </p>
            <p className="text-lg font-bold text-emerald-600 mt-1 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Online Prepaid
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Zero COD • Instant verification
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <DollarIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Added Products */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageIcon className="w-4 h-4 text-neutral-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Recently Added Products
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-neutral-600 hover:text-black font-semibold transition"
            >
              All Products →
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              No products in catalog yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentProducts.map((product) => {
                const image = product.images[0]?.url || "/placeholder.png";
                const primaryPrice = product.variants[0]?.price || 0;
                return (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition block group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={image}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate group-hover:underline">
                          {product.title}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {product.collection} • {product.variants.length} variant(s)
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-neutral-900 font-mono">
                        ₹{primaryPrice.toLocaleString("en-IN")}
                      </span>
                      <p className="text-[10px] text-neutral-500 uppercase mt-0.5 font-medium">
                        {product.status}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Inventory Alerts (Stock ≤ 5)
              </h2>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs text-neutral-600 hover:text-black font-semibold transition"
            >
              Manage Stock →
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-emerald-600 font-semibold">
              ✓ All catalog variants are currently above low-stock threshold.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {lowStockItems.map((variant) => {
                const image = variant.product.images[0]?.url || "/placeholder.png";
                return (
                  <div
                    key={variant.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={image}
                        alt={variant.product.title}
                        className="w-10 h-10 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {variant.product.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Size: <span className="text-neutral-900 font-bold">{variant.title}</span>
                          {variant.sku && ` • SKU: ${variant.sku}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold font-mono rounded border ${
                          variant.inventory === 0
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {variant.inventory === 0 ? "OUT OF STOCK" : `${variant.inventory} left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
