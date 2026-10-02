"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  TruckIcon,
  AlertCircleIcon,
  DollarIcon,
  CopyIcon,
} from "./Icons";

interface OrderDetailItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    title: string;
    sku: string | null;
    product: {
      id: string;
      title: string;
      handle: string;
      images: { url: string }[];
    };
  };
}

export interface AdminOrderRefund {
  id: string;
  razorpayRefundId: string | null;
  amount: number;
  status: string;
  reason: string | null;
  adminEmail: string | null;
  createdAt: string | Date;
}

export interface AdminOrderDetail {
  id: string;
  amount: number;
  status: string;
  paymentStatus?: string;
  shippingStatus: string;
  awb: string | null;
  trackingNumber: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string | Date;
  deliveredAt: string | Date | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    createdAt?: string | Date;
  };
  address: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    street: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  } | null;
  items: OrderDetailItem[];
  returnRequest: {
    id: string;
    reason: string;
    type: string;
    isDefective: boolean;
    mediaUrl: string;
    status: string;
    adminNotes: string | null;
    createdAt: string | Date;
  } | null;
  refunds?: AdminOrderRefund[];
}

interface OrderDetailClientProps {
  initialOrder: AdminOrderDetail;
}

export function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const [order, setOrder] = useState<AdminOrderDetail>(initialOrder);
  const [status, setStatus] = useState(order.status);
  const [shippingStatus, setShippingStatus] = useState(order.shippingStatus);
  const [awb, setAwb] = useState(order.awb || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Refund Management State
  const [refunds, setRefunds] = useState<AdminOrderRefund[]>(initialOrder.refunds || []);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
  const [customRefundAmount, setCustomRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("");
  const [refundProcessing, setRefundProcessing] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const totalRefunded = refunds
    .filter((r) => r.status !== "FAILED")
    .reduce((sum, r) => sum + r.amount, 0);
  const remainingRefundable = Math.max(0, order.amount - totalRefunded);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundError(null);

    const amountToRefund =
      refundType === "FULL" ? remainingRefundable : parseFloat(customRefundAmount);

    if (isNaN(amountToRefund) || amountToRefund <= 0) {
      setRefundError("Please enter a valid refund amount greater than 0");
      return;
    }

    if (amountToRefund > remainingRefundable) {
      setRefundError(`Maximum allowable refund is ₹${remainingRefundable.toLocaleString("en-IN")}`);
      return;
    }

    setRefundProcessing(true);

    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: amountToRefund,
          refundType,
          reason: refundReason.trim() || "Admin initiated refund",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process refund via Razorpay");
      }

      if (data.refund) {
        setRefunds((prev) => [data.refund, ...prev]);
      }

      if (amountToRefund >= remainingRefundable) {
        setStatus("REFUNDED");
        setOrder((prev) => ({ ...prev, status: "REFUNDED", paymentStatus: "REFUNDED" }));
      } else {
        setOrder((prev) => ({ ...prev, paymentStatus: "PARTIALLY_REFUNDED" }));
      }

      setShowRefundModal(false);
      setCustomRefundAmount("");
      setRefundReason("");
      setMessage({
        text: `Successfully processed refund of ₹${amountToRefund.toLocaleString("en-IN")} via Razorpay!`,
        type: "success",
      });
    } catch (err: any) {
      setRefundError(err.message || "Failed to execute refund");
    } finally {
      setRefundProcessing(false);
    }
  };

  const handleUpdateFulfillment = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          shippingStatus,
          awb: awb.trim() || null,
          trackingNumber: trackingNumber.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrder((prev) => ({
        ...prev,
        status: data.order.status,
        shippingStatus: data.order.shippingStatus,
        awb: data.order.awb,
        trackingNumber: data.order.trackingNumber,
      }));

      setMessage({ text: "Fulfillment details updated successfully!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update fulfillment", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: `${label} copied to clipboard!`, type: "success" });
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300 transition shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-mono">
                Order #{order.id}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                  order.status === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : order.status === "CANCELLED"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : order.status === "SHIPPED"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdateFulfillment}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition disabled:opacity-50 shadow-sm"
          >
            {saving ? "Saving..." : "Save Order Changes"}
          </button>
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

      {/* Return Request Banner if active */}
      {order.returnRequest && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="w-5 h-5 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Customer Return / Exchange Request
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase">
              {order.returnRequest.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-neutral-500 block">Type:</span>
              <span className="font-semibold text-neutral-900 uppercase">{order.returnRequest.type}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Defective Claim:</span>
              <span className="font-semibold text-neutral-900">{order.returnRequest.isDefective ? "Yes (Covered)" : "No"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Unboxing Media:</span>
              <a
                href={order.returnRequest.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 underline hover:text-black font-semibold"
              >
                View Proof Video/Photo ↗
              </a>
            </div>
          </div>

          <div className="text-xs pt-2 border-t border-amber-200">
            <span className="text-neutral-500">Reason: </span>
            <span className="text-neutral-800">{order.returnRequest.reason}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Items & Financials */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items Table */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Ordered Apparel Items ({order.items.length})
            </h2>

            <div className="divide-y divide-neutral-200">
              {order.items.map((item) => {
                const image = item.variant?.product?.images[0]?.url || "/placeholder.png";
                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={image}
                        alt={item.variant?.product?.title || "Product"}
                        className="w-14 h-14 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.variant?.product?.handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-neutral-900 text-xs hover:underline truncate block"
                        >
                          {item.variant?.product?.title || "Product"}
                        </Link>
                        <p className="text-[11px] text-neutral-600 font-mono mt-0.5">
                          Size: <span className="text-neutral-900 font-bold">{item.variant?.title}</span>
                          {item.variant?.sku && ` • SKU: ${item.variant.sku}`}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-bold text-neutral-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Totals */}
            <div className="pt-4 border-t border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-semibold text-neutral-900">
                  ₹{order.items.reduce((acc, i) => acc + i.price * i.quantity, 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping:</span>
                <span className="font-mono text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Amount Charged:</span>
                <span className="font-mono text-base">₹{order.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Payment Identification */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <DollarIcon className="w-4 h-4 text-neutral-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Payment Verification
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 text-[10px] uppercase font-semibold block">
                  Payment Status
                </span>
                <span className="font-semibold text-neutral-900 mt-1 block">
                  {order.paymentStatus || (order.razorpayPaymentId ? "PAID (ONLINE PREPAID)" : "PENDING PAYMENT")}
                </span>
              </div>

              {order.razorpayPaymentId && (
                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 text-[10px] uppercase font-semibold">
                      Razorpay Payment ID
                    </span>
                    <button
                      onClick={() => copyToClipboard(order.razorpayPaymentId!, "Payment ID")}
                      className="text-neutral-500 hover:text-neutral-900"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-900 font-semibold mt-1 block truncate">
                    {order.razorpayPaymentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Refund Operations & Gateway Reversals */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <DollarIcon className="w-4 h-4 text-neutral-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Refund Operations & Reversals
                </h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border self-start sm:self-auto ${
                  totalRefunded === 0
                    ? "bg-neutral-100 text-neutral-700 border-neutral-200"
                    : remainingRefundable === 0
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {totalRefunded === 0
                  ? "Zero Refunds"
                  : remainingRefundable === 0
                  ? "Fully Refunded"
                  : "Partially Refunded"}
              </span>
            </div>

            {/* Refund Ledger */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] uppercase text-neutral-500 block font-semibold">
                  Original Paid
                </span>
                <span className="font-mono text-sm font-bold text-neutral-900 mt-1 block">
                  ₹{order.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] uppercase text-neutral-500 block font-semibold">
                  Total Refunded
                </span>
                <span className="font-mono text-sm font-bold text-red-600 mt-1 block">
                  ₹{totalRefunded.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] uppercase text-neutral-500 block font-semibold">
                  Remaining Refundable
                </span>
                <span className="font-mono text-sm font-bold text-emerald-600 mt-1 block">
                  ₹{remainingRefundable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Refund Trigger Controls */}
            <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-neutral-500">
                {order.razorpayPaymentId
                  ? remainingRefundable > 0
                    ? "Refunds execute directly via Razorpay API to the customer original payment account."
                    : "Order is 100% refunded. No balance remaining to reverse."
                  : "No Razorpay payment captured for this order yet."}
              </p>
              {order.razorpayPaymentId && remainingRefundable > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRefundType("FULL");
                    setCustomRefundAmount(remainingRefundable.toString());
                    setRefundError(null);
                    setShowRefundModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm shrink-0"
                >
                  Initiate Refund
                </button>
              )}
            </div>

            {/* Previous Refunds Table */}
            {refunds.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Refund Transaction History ({refunds.length})
                </h3>
                <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase text-neutral-600 font-bold tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Refund ID</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Admin</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {refunds.map((ref) => (
                        <tr key={ref.id} className="hover:bg-neutral-50/50">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-800">
                            {ref.razorpayRefundId || ref.id}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-red-600">
                            ₹{ref.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ref.status === "PROCESSED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : ref.status === "FAILED"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {ref.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600 max-w-[150px] truncate" title={ref.reason || ""}>
                            {ref.reason || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-500 font-mono text-[10px]">
                            {ref.adminEmail || "Admin"}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-500 font-mono text-[10px] whitespace-nowrap">
                            {new Date(ref.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Fulfillment Controls */}
        <div className="space-y-6">
          {/* Logistics & Order Progress Controls */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-neutral-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Fulfillment Controls
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-semibold"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Shipping Carrier Status
              </label>
              <select
                value={shippingStatus}
                onChange={(e) => setShippingStatus(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="PENDING">PENDING</option>
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Delhivery AWB Number
              </label>
              <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="e.g. 143256789012"
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Air Waybill for Delhivery courier shipment tracking.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpdateFulfillment}
              disabled={saving}
              className="w-full py-2.5 px-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
            >
              {saving ? "Saving Changes..." : "Update Fulfillment"}
            </button>
          </div>

          {/* Customer & Shipping Address */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Customer & Delivery Address
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-neutral-500 text-[11px] block">Customer Name</span>
                <span className="font-semibold text-neutral-900">
                  {order.user?.name || "Customer Account"}
                </span>
              </div>

              {order.user?.email && (
                <div>
                  <span className="text-neutral-500 text-[11px] block">Email</span>
                  <span className="text-neutral-700">{order.user.email}</span>
                </div>
              )}

              {order.user?.phone && (
                <div>
                  <span className="text-neutral-500 text-[11px] block">Phone</span>
                  <span className="font-mono text-neutral-700">+91 {order.user.phone}</span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200">
                <span className="text-neutral-500 text-[11px] uppercase font-semibold block mb-1">
                  Shipping Destination
                </span>
                {order.address ? (
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs leading-relaxed">
                    <p className="font-semibold text-neutral-900">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <p className="mt-0.5">{order.address.street}</p>
                    <p>
                      {order.address.city}, {order.address.state} — {order.address.pinCode}
                    </p>
                    <p className="text-neutral-500 uppercase mt-0.5">India</p>
                    {order.address.phoneNumber && (
                      <p className="mt-1 font-mono text-[11px] text-neutral-600">
                        Phone: {order.address.phoneNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-xs italic">
                    No shipping address record attached.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <DollarIcon className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 font-mono">
                  Initiate Razorpay Refund
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!refundProcessing) setShowRefundModal(false);
                }}
                disabled={refundProcessing}
                className="text-neutral-400 hover:text-neutral-700 text-lg font-bold p-1 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="p-6 space-y-4">
              {/* Order Context */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order ID:</span>
                  <span className="font-mono font-bold text-neutral-900">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment ID:</span>
                  <span className="font-mono text-neutral-800">{order.razorpayPaymentId}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200">
                  <span className="text-neutral-500">Total Charged:</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Already Refunded:</span>
                  <span className="font-mono font-semibold text-red-600">
                    ₹{totalRefunded.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-neutral-200">
                  <span className="text-neutral-900">Max Refundable:</span>
                  <span className="font-mono text-emerald-600">
                    ₹{remainingRefundable.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Refund Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2">
                  Refund Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRefundType("FULL");
                      setCustomRefundAmount(remainingRefundable.toString());
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      refundType === "FULL"
                        ? "border-black bg-neutral-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <span className="text-xs font-bold block uppercase tracking-wider">
                      Full Refund
                    </span>
                    <span className="font-mono text-xs mt-1 block opacity-90">
                      ₹{remainingRefundable.toLocaleString("en-IN")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRefundType("PARTIAL");
                      setCustomRefundAmount("");
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      refundType === "PARTIAL"
                        ? "border-black bg-neutral-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <span className="text-xs font-bold block uppercase tracking-wider">
                      Partial Refund
                    </span>
                    <span className="text-xs mt-1 block opacity-80">
                      Custom Amount
                    </span>
                  </button>
                </div>
              </div>

              {/* Custom Amount Input if Partial */}
              {refundType === "PARTIAL" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Refund Amount (INR ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-mono">₹</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max={remainingRefundable}
                      value={customRefundAmount}
                      onChange={(e) => setCustomRefundAmount(e.target.value)}
                      placeholder={`Max ${remainingRefundable}`}
                      required
                      className="w-full pl-7 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Amount cannot exceed ₹{remainingRefundable.toLocaleString("en-IN")}.
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reason for Refund (Recorded for Audit Log)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g., Customer return approved, order cancelled prior to dispatch, defective item claim"
                  rows={2}
                  required
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                />
              </div>

              {/* Warning Alert */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertCircleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Irreversible Financial Transaction:</strong> Submitting will instantly execute an API call to Razorpay to transfer funds back to the buyer's original payment method.
                </div>
              </div>

              {/* Error Banner */}
              {refundError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{refundError}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  disabled={refundProcessing}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundProcessing}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {refundProcessing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Contacting Razorpay...
                    </>
                  ) : (
                    `Execute Refund (₹${(refundType === "FULL" ? remainingRefundable : parseFloat(customRefundAmount) || 0).toLocaleString("en-IN")})`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
