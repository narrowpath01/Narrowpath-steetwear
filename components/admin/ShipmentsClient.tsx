"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SearchIcon,
  TruckIcon,
  CheckIcon,
  AlertCircleIcon,
  CopyIcon,
  EyeIcon,
} from "./Icons";

export interface AdminShipmentOrder {
  id: string;
  amount: number;
  status: string;
  paymentStatus?: string;
  shippingStatus: string;
  awb: string | null;
  trackingNumber: string | null;
  createdAt: string | Date;
  deliveredAt: string | Date | null;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  address: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
    phoneNumber: string | null;
  } | null;
  items: {
    id: string;
    quantity: number;
  }[];
}

interface ShipmentsClientProps {
  initialOrders: AdminShipmentOrder[];
}

export function ShipmentsClient({ initialOrders }: ShipmentsClientProps) {
  const [orders, setOrders] = useState<AdminShipmentOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loadingAwb, setLoadingAwb] = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<{
    waybill: string;
    orderId: string;
    data: any;
    loading: boolean;
    error: string | null;
  } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Derived counts
  const totalShipments = orders.filter((o) => o.awb).length;
  const inTransitCount = orders.filter((o) =>
    ["IN_TRANSIT", "SHIPPED", "PICKED_UP", "DISPATCHED"].includes((o.shippingStatus || "").toUpperCase())
  ).length;
  const outForDeliveryCount = orders.filter(
    (o) => (o.shippingStatus || "").toUpperCase().includes("OUT_FOR_DELIVERY") || (o.shippingStatus || "").toUpperCase().includes("OUT FOR DELIVERY")
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED" || o.shippingStatus === "DELIVERED").length;
  const ndrCount = orders.filter(
    (o) =>
      o.shippingStatus?.toUpperCase().includes("NDR") ||
      o.shippingStatus?.toUpperCase().includes("UNDELIVERED") ||
      o.status === "NDR"
  ).length;
  const rtoCount = orders.filter(
    (o) => o.shippingStatus?.toUpperCase().includes("RTO") || o.status === "RTO"
  ).length;

  const filteredOrders = orders.filter((order) => {
    const s = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      order.id.toLowerCase().includes(s) ||
      (order.awb && order.awb.toLowerCase().includes(s)) ||
      order.user?.name?.toLowerCase().includes(s) ||
      order.user?.phone?.includes(s) ||
      order.address?.city.toLowerCase().includes(s) ||
      order.address?.pinCode.includes(s);

    if (!matchesSearch) return false;

    if (filter === "ALL") return true;
    if (filter === "UNFULFILLED") return !order.awb;
    if (filter === "IN_TRANSIT") {
      return ["IN_TRANSIT", "SHIPPED", "PICKED_UP", "DISPATCHED"].includes((order.shippingStatus || "").toUpperCase());
    }
    if (filter === "OUT_FOR_DELIVERY") {
      return (order.shippingStatus || "").toUpperCase().includes("OUT");
    }
    if (filter === "DELIVERED") {
      return order.status === "DELIVERED" || order.shippingStatus === "DELIVERED";
    }
    if (filter === "NDR") {
      return order.shippingStatus?.toUpperCase().includes("NDR") || order.shippingStatus?.toUpperCase().includes("UNDELIVERED") || order.status === "NDR";
    }
    if (filter === "RTO") {
      return order.shippingStatus?.toUpperCase().includes("RTO") || order.status === "RTO";
    }
    return true;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: `${label} copied to clipboard!`, type: "success" });
    setTimeout(() => setMessage(null), 2500);
  };

  const handleManifestDelhivery = async (orderId: string) => {
    setLoadingAwb(orderId);
    setMessage(null);

    try {
      const res = await fetch("/api/shipping/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to manifest shipment");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, awb: data.waybill, trackingNumber: data.waybill, shippingStatus: "Manifested", status: "SHIPPED" }
            : o
        )
      );

      setMessage({ text: `Delhivery Waybill ${data.waybill} generated successfully!`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to manifest Delhivery shipment", type: "error" });
    } finally {
      setLoadingAwb(null);
    }
  };

  const handleLiveTracking = async (waybill: string, orderId: string) => {
    setTrackingModal({ waybill, orderId, data: null, loading: true, error: null });

    try {
      const res = await fetch(`/api/shipping/track?waybill=${encodeURIComponent(waybill)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch Delhivery tracking scans");

      setTrackingModal({
        waybill,
        orderId,
        data: data.ShipmentData?.[0]?.Shipment || data,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setTrackingModal((prev) =>
        prev ? { ...prev, loading: false, error: err.message || "Tracking lookup failed" } : null
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-mono">
            Logistics & Delhivery Shipments
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time Delhivery dispatch, AWB assignment, live scan status, NDR management, and RTO tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm text-xs font-mono">
            <strong className="text-neutral-900 font-bold">{totalShipments}</strong> Manifested AWBs
          </span>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Orders</span>
          <span className="font-mono text-lg font-black text-neutral-900 mt-1 block">{orders.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-blue-600 block">In Transit</span>
          <span className="font-mono text-lg font-black text-blue-700 mt-1 block">{inTransitCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-600 block">Out For Delivery</span>
          <span className="font-mono text-lg font-black text-amber-700 mt-1 block">{outForDeliveryCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Delivered</span>
          <span className="font-mono text-lg font-black text-emerald-700 mt-1 block">{deliveredCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-600 block">NDR Alerts</span>
          <span className="font-mono text-lg font-black text-rose-700 mt-1 block">{ndrCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-purple-600 block">RTO / Returns</span>
          <span className="font-mono text-lg font-black text-purple-700 mt-1 block">{rtoCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by AWB, Order ID, Customer, Pin Code, or City..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs overflow-x-auto">
          {[
            { id: "ALL", label: "All" },
            { id: "IN_TRANSIT", label: "In Transit" },
            { id: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "NDR", label: "NDR Cases" },
            { id: "RTO", label: "RTO" },
            { id: "UNFULFILLED", label: "Unmanifested" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                filter === tab.id
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase text-neutral-600 font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Order / Date</th>
                <th className="py-3 px-4">AWB (Delhivery)</th>
                <th className="py-3 px-4">Recipient & Destination</th>
                <th className="py-3 px-4">Items / Total</th>
                <th className="py-3 px-4">Carrier Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold text-neutral-800">No shipments found</p>
                    <p className="text-[11px] mt-0.5">Try altering your search filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const hasAwb = !!order.awb;
                  const isDelivered = order.status === "DELIVERED" || order.shippingStatus === "DELIVERED";
                  const isNdr = order.shippingStatus?.toUpperCase().includes("NDR");
                  const isRto = order.shippingStatus?.toUpperCase().includes("RTO");

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/50 transition">
                      {/* Order / Date */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-neutral-900 hover:underline block"
                        >
                          #{order.id.slice(-8)}
                        </Link>
                        <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* AWB */}
                      <td className="py-3.5 px-4">
                        {hasAwb ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-neutral-900 text-xs bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                              {order.awb}
                            </span>
                            <button
                              onClick={() => handleCopy(order.awb!, "AWB")}
                              title="Copy AWB"
                              className="text-neutral-400 hover:text-black p-0.5"
                            >
                              <CopyIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase">
                            Pending Manifest
                          </span>
                        )}
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 block truncate max-w-[160px]">
                          {order.address
                            ? `${order.address.firstName} ${order.address.lastName}`
                            : order.user?.name || "Customer"}
                        </span>
                        <span className="text-[11px] text-neutral-600 font-mono block truncate max-w-[160px]">
                          {order.address ? `${order.address.city}, ${order.address.pinCode}` : "—"}
                        </span>
                      </td>

                      {/* Items / Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-neutral-900 block">
                          ₹{order.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono block">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                        </span>
                      </td>

                      {/* Carrier Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border inline-block ${
                            isDelivered
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isNdr
                              ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                              : isRto
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : hasAwb
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {order.shippingStatus || "PENDING"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasAwb ? (
                            <button
                              onClick={() => handleLiveTracking(order.awb!, order.id)}
                              className="px-2.5 py-1 bg-white border border-neutral-300 hover:border-black text-neutral-800 text-[11px] font-bold rounded-lg transition shadow-sm inline-flex items-center gap-1"
                            >
                              <TruckIcon className="w-3.5 h-3.5" />
                              Track Live
                            </button>
                          ) : (
                            <button
                              onClick={() => handleManifestDelhivery(order.id)}
                              disabled={loadingAwb === order.id}
                              className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition shadow-sm disabled:opacity-50"
                            >
                              {loadingAwb === order.id ? "Manifesting..." : "Manifest Delhivery"}
                            </button>
                          )}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-1 text-neutral-400 hover:text-black transition"
                            title="Order Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Delhivery Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-neutral-800" />
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 font-mono">
                  Live Delhivery Tracking (AWB: {trackingModal.waybill})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModal(null)}
                className="text-neutral-400 hover:text-black font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {trackingModal.loading ? (
                <div className="py-12 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Querying Delhivery Carrier Tracking API...
                </div>
              ) : trackingModal.error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <p className="font-bold">Tracking Lookup Error:</p>
                  <p className="mt-1">{trackingModal.error}</p>
                </div>
              ) : trackingModal.data ? (
                <div className="space-y-4 text-xs">
                  {/* Status overview */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Status</span>
                      <span className="font-bold text-neutral-900 uppercase">
                        {trackingModal.data.Status?.Status || "In Transit"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Destination</span>
                      <span className="font-semibold text-neutral-900">
                        {trackingModal.data.Consignee?.City || "India"}
                      </span>
                    </div>
                  </div>

                  {/* Scans timeline */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Scan Activity History
                    </h4>
                    {trackingModal.data.Scans && trackingModal.data.Scans.length > 0 ? (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                        {trackingModal.data.Scans.map((scan: any, idx: number) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-black border-2 border-white ring-2 ring-neutral-300" />
                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-2.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-neutral-900 uppercase">
                                  {scan.ScanDetail?.Scan || scan.Scan}
                                </span>
                                <span className="text-neutral-500 font-mono text-[10px]">
                                  {scan.ScanDetail?.ScanDateTime
                                    ? new Date(scan.ScanDetail.ScanDateTime).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-600 mt-0.5">
                                Location: {scan.ScanDetail?.ScannedLocation || "Hub"}
                              </p>
                              {scan.ScanDetail?.Instructions && (
                                <p className="text-[10px] text-neutral-500 italic mt-0.5">
                                  {scan.ScanDetail.Instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500 italic p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        Waybill is registered with Delhivery. Carrier scan records will populate once the package is received at the origin hub.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingModal(null)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
