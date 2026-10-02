"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUpIcon, DollarIcon, TruckIcon, OrdersIcon, PackageIcon } from "./Icons";

export interface AnalyticsProps {
  data: {
    grossSales: number;
    netSales: number;
    totalRefundAmount: number;
    totalOrders: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    deliveredOrdersCount: number;
    shippedOrdersCount: number;
    ndrCount: number;
    rtoCount: number;
    cancelledOrdersCount: number;
    aov: number;
    totalCustomers: number;
    repeatCustomersCount: number;
    topProducts: Array<{
      id: string;
      title: string;
      handle: string;
      image: string;
      salesCount: number;
      revenue: number;
    }>;
    recentDailySales: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    refundsCount: number;
  };
}

export function AnalyticsClient({ data }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"ALL" | "30D" | "7D">("ALL");

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-mono">
            Commercial Analytics & Performance
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Aggregated revenue metrics, prepaid payment settlement rates, Delhivery logistics, and apparel sales volume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
            100% Online Prepaid (Razorpay)
          </span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase font-bold tracking-wider">Gross Sales</span>
            <DollarIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 font-mono">
            ₹{data.grossSales.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-neutral-500">
            Total prepaid value of confirmed customer orders.
          </p>
        </div>

        {/* Net Revenue */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase font-bold tracking-wider">Net Revenue</span>
            <TrendingUpIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            ₹{data.netSales.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-neutral-500">
            Gross revenue minus ₹{data.totalRefundAmount.toLocaleString("en-IN")} refunds.
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase font-bold tracking-wider">Average Order (AOV)</span>
            <OrdersIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 font-mono">
            ₹{Math.round(data.aov).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-neutral-500">
            Average ticket size across {data.paidOrdersCount} completed orders.
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="uppercase font-bold tracking-wider">Total Orders</span>
            <PackageIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 font-mono">
            {data.totalOrders}
          </p>
          <p className="text-[11px] text-neutral-500">
            {data.paidOrdersCount} paid • {data.deliveredOrdersCount} delivered
          </p>
        </div>
      </div>

      {/* Operations Breakdown: Payments & Delhivery Shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment & Refund Ledger */}
        <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarIcon className="w-4 h-4 text-neutral-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Razorpay Payment Settlement
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              No COD
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-600">Captured Online Payments:</span>
              <span className="font-mono font-bold text-neutral-900">
                {data.paidOrdersCount} orders (₹{data.grossSales.toLocaleString("en-IN")})
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-600">Pending / Abandoned Checkout:</span>
              <span className="font-mono font-bold text-amber-700">
                {data.pendingOrdersCount} orders
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-600">Executed Gateway Refunds:</span>
              <span className="font-mono font-bold text-rose-700">
                {data.refundsCount} refunds (-₹{data.totalRefundAmount.toLocaleString("en-IN")})
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 font-semibold text-neutral-900">
              <span>Final Realized Revenue:</span>
              <span className="font-mono text-emerald-700 text-sm font-bold">
                ₹{data.netSales.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Delhivery Logistics & Fulfillment */}
        <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-neutral-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Delhivery Courier Logistics
              </h2>
            </div>
            <Link
              href="/admin/shipments"
              className="text-xs text-blue-600 hover:underline font-bold font-mono"
            >
              Shipments ↗
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Delivered Orders</span>
              <span className="font-mono text-xl font-bold text-emerald-600 mt-1 block">
                {data.deliveredOrdersCount}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">In Transit / Shipped</span>
              <span className="font-mono text-xl font-bold text-blue-600 mt-1 block">
                {data.shippedOrdersCount}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">NDR Exceptions</span>
              <span className="font-mono text-xl font-bold text-rose-600 mt-1 block">
                {data.ndrCount}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">RTO (Returned)</span>
              <span className="font-mono text-xl font-bold text-purple-600 mt-1 block">
                {data.rtoCount}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex justify-between text-xs">
            <span className="text-neutral-600">Registered Customer Accounts:</span>
            <span className="font-mono font-bold text-neutral-900">
              {data.totalCustomers} ({data.repeatCustomersCount} repeat buyers)
            </span>
          </div>
        </div>
      </div>

      {/* Top Performing Apparel Products */}
      <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageIcon className="w-4 h-4 text-neutral-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Top Selling Apparel Products
            </h2>
          </div>
          <Link
            href="/admin/products"
            className="text-xs text-neutral-600 hover:text-black font-semibold"
          >
            View Catalog ↗
          </Link>
        </div>

        {data.topProducts.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-6 text-center">
            No product sales volume recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase text-neutral-600 font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.topProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 flex items-center gap-3">
                      <span className="text-neutral-400 font-mono text-xs w-4">#{idx + 1}</span>
                      <img
                        src={p.image || "/placeholder.png"}
                        alt={p.title}
                        className="w-9 h-9 object-cover rounded bg-neutral-100 border border-neutral-200"
                      />
                      <Link
                        href={`/product/${p.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-neutral-900 hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-800 text-right">
                      {p.salesCount} units
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-900 text-right">
                      ₹{p.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
