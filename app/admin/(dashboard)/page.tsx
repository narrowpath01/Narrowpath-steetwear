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
} from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Query real database metrics in parallel
  const [
    totalProducts,
    activeProducts,
    lowStockVariantsCount,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalCustomers,
    publishedBlogs,
    activeAnnouncement,
    recentProducts,
    lowStockItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.variant.count({ where: { inventory: { lte: 5 } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["DELIVERED", "COMPLETED"] } } }),
    prisma.user.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    }),
    prisma.product.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        images: { take: 1 },
        variants: true,
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

  return (
    <div className="space-y-8">
      {/* Header and Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Operations Center
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Platform metrics, apparel catalog status, and inventory health monitoring.
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
            href="/admin/blogs/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 text-neutral-700 hover:text-black hover:border-neutral-400 text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <BlogIcon className="w-4 h-4" />
            <span>Write Blog</span>
          </Link>
          <Link
            href="/admin/announcements"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 text-neutral-700 hover:text-black hover:border-neutral-400 text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <MegaphoneIcon className="w-4 h-4" />
            <span>Announcements</span>
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

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Catalog Size</span>
            <ProductsIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
              {totalProducts}
            </span>
            <span className="text-xs text-neutral-400">products</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2 font-semibold">
            {activeProducts} Active in Storefront
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Inventory Health</span>
            <InventoryIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight font-mono ${
                lowStockVariantsCount > 0 ? "text-amber-600" : "text-neutral-900"
              }`}
            >
              {lowStockVariantsCount}
            </span>
            <span className="text-xs text-neutral-400">low stock</span>
          </div>
          <Link
            href="/admin/inventory"
            className="text-[11px] text-neutral-600 hover:text-black mt-2 inline-block font-semibold underline underline-offset-4"
          >
            Manage Stock Replenishment →
          </Link>
        </div>

        {/* Orders Pipeline */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order Volume</span>
            <OrdersIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
              {totalOrders}
            </span>
            <span className="text-xs text-neutral-400">orders</span>
          </div>
          <p className="text-[11px] text-neutral-600 mt-2">
            <span className="text-amber-600 font-semibold">{pendingOrders} Pending</span>{" "}
            • <span className="text-emerald-600 font-semibold">{deliveredOrders} Fulfilled</span>
          </p>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer Base</span>
            <CustomersIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
              {totalCustomers}
            </span>
            <span className="text-xs text-neutral-400">accounts</span>
          </div>
          <Link
            href="/admin/customers"
            className="text-[11px] text-neutral-600 hover:text-black mt-2 inline-block font-semibold underline underline-offset-4"
          >
            View Customer Accounts →
          </Link>
        </div>
      </div>

      {/* Secondary Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Editorial Content */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
              Editorial Blog Stories
            </p>
            <p className="text-xl font-bold text-neutral-900 mt-1 font-mono">
              {publishedBlogs} Articles Published
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Lookbooks, garment drops, and styling guides
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-100 text-neutral-700">
            <BlogIcon className="w-5 h-5" />
          </div>
        </div>

        {/* System Operations Status */}
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
              Platform Infrastructure
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Supabase PostgreSQL • Cloudinary CDN • Next.js
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-100 text-neutral-700">
            <PackageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Watchlist & Recently Added Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              Manage Inventory →
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
                        className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded border ${
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

        {/* Recently Added Products */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Recently Added Products
            </h2>
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
      </div>
    </div>
  );
}
