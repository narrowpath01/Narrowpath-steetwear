"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SearchIcon,
  EyeIcon,
  TruckIcon,
} from "./Icons";

export interface AdminOrderSummary {
  id: string;
  amount: number;
  status: string;
  shippingStatus: string;
  awb: string | null;
  razorpayPaymentId: string | null;
  createdAt: string | Date;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  address: {
    city: string;
    state: string;
  } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
  }[];
}

interface OrderListClientProps {
  initialOrders: AdminOrderSummary[];
}

export function OrderListClient({ initialOrders }: OrderListClientProps) {
  const [orders, setOrders] = useState<AdminOrderSummary[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      search === "" ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.phone?.includes(search) ||
      (order.awb && order.awb.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review customer transactions, update order progress, and dispatch shipments with Delhivery AWB.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm text-xs">
          <span className="text-neutral-500">Total Recorded Orders: </span>
          <span className="font-bold text-neutral-900 font-mono">{orders.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID (e.g. #cmuo0jj8), Customer Name, Phone, or AWB..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs overflow-x-auto">
          {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                statusFilter === s
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No orders match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Fulfillment</th>
                  <th className="py-3.5 px-4 font-semibold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {filteredOrders.map((order) => {
                  const statusColor =
                    order.status === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : order.status === "CANCELLED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : order.status === "SHIPPED"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";

                  const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/80 transition group">
                      {/* Order ID */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-neutral-900 hover:underline flex items-center gap-1.5"
                        >
                          <span>#{order.id.slice(0, 8)}</span>
                        </Link>
                        {order.awb && (
                          <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono mt-0.5">
                            <TruckIcon className="w-3 h-3 text-neutral-400" />
                            <span>AWB: {order.awb}</span>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <span className="block text-[10px] text-neutral-400">
                          {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-neutral-900 truncate max-w-[150px]">
                          {order.user?.name || "Customer"}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[150px]">
                          {order.user?.phone || order.user?.email || "—"}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-neutral-600 text-xs">
                        {order.address ? `${order.address.city}, ${order.address.state}` : "—"}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">
                        {totalItems} item(s)
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                            order.razorpayPaymentId
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {order.razorpayPaymentId ? "PAID (ONLINE)" : "PENDING PAYMENT"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${statusColor}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-900 text-xs font-semibold transition shadow-sm"
                        >
                          <EyeIcon className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
