"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchIcon, AlertCircleIcon, CheckIcon } from "./Icons";

export interface AdminReturnSummary {
  id: string;
  orderId: string;
  reason: string;
  type: string;
  isDefective: boolean;
  mediaUrl: string;
  status: string;
  adminNotes: string | null;
  createdAt: string | Date;
  order: {
    id: string;
    amount: number;
    status: string;
    paymentStatus?: string;
    shippingStatus: string;
    razorpayPaymentId: string | null;
    createdAt: string | Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
    };
    address: {
      firstName: string;
      lastName: string;
      city: string;
      state: string;
      pinCode: string;
    } | null;
    items: {
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
    }[];
  };
}

interface ReturnsClientProps {
  initialReturns: AdminReturnSummary[];
}

export function ReturnsClient({ initialReturns }: ReturnsClientProps) {
  const [returns, setReturns] = useState<AdminReturnSummary[]>(initialReturns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReturn, setSelectedReturn] = useState<AdminReturnSummary | null>(null);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | "PICKUP_SCHEDULED" | "RECEIVED" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      search === "" ||
      ret.id.toLowerCase().includes(search.toLowerCase()) ||
      ret.orderId.toLowerCase().includes(search.toLowerCase()) ||
      ret.order?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      ret.order?.user?.phone?.includes(search) ||
      ret.reason.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn || !actionType) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/returns/${selectedReturn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update return request");

      setReturns((prev) =>
        prev.map((r) =>
          r.id === selectedReturn.id
            ? { ...r, status: actionType, adminNotes: adminNotes.trim() || r.adminNotes }
            : r
        )
      );

      setMessage({
        text: `Return request #${selectedReturn.id.slice(-6)} marked as ${actionType}.`,
        type: "success",
      });
      setSelectedReturn(null);
      setActionType(null);
      setAdminNotes("");
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update return", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-mono">
            Returns & Exchanges Operations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review customer claims, unboxing evidence, reverse shipments, and order refund eligibility.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm text-xs">
          <span className="text-neutral-500">Total Cases: </span>
          <span className="font-bold text-neutral-900 font-mono">{returns.length}</span>
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

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Return ID, or Reason..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs overflow-x-auto">
          {["ALL", "PENDING_REVIEW", "APPROVED", "PICKUP_SCHEDULED", "RECEIVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                statusFilter === s
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      {filteredReturns.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-neutral-200 shadow-sm space-y-2">
          <p className="text-sm font-bold text-neutral-800">No return requests found</p>
          <p className="text-xs text-neutral-500">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search criteria or status filter."
              : "When customers request returns or exchanges, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((ret) => (
            <div
              key={ret.id}
              className="p-5 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4 hover:border-neutral-300 transition"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-neutral-900">
                    Return #{ret.id.slice(-8)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      ret.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ret.status === "REJECTED"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : ret.status === "RECEIVED"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {ret.status.replace("_", " ")}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 text-[10px] font-bold uppercase">
                    {ret.type}
                  </span>
                  {ret.isDefective && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase">
                      Defective Claim
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Requested on {new Date(ret.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/admin/orders/${ret.orderId}`}
                    className="ml-2 text-xs font-bold text-neutral-900 hover:underline inline-flex items-center gap-1 font-mono"
                  >
                    Order #{ret.orderId.slice(-8)} ↗
                  </Link>
                </div>
              </div>

              {/* Order & Customer Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer */}
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Customer</span>
                  <p className="font-semibold text-neutral-900">{ret.order?.user?.name || "Customer"}</p>
                  <p className="text-neutral-600">{ret.order?.user?.email || "—"}</p>
                  <p className="font-mono text-neutral-600">{ret.order?.user?.phone ? `+91 ${ret.order.user.phone}` : "—"}</p>
                </div>

                {/* Return Reason & Proof */}
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Claim & Evidence</span>
                  <p className="text-neutral-800 line-clamp-2" title={ret.reason}>
                    <strong className="text-neutral-900">Reason: </strong> {ret.reason}
                  </p>
                  {ret.mediaUrl ? (
                    <a
                      href={ret.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black font-semibold underline text-[11px] inline-block mt-1 hover:text-neutral-700"
                    >
                      View Customer Unboxing Media ↗
                    </a>
                  ) : (
                    <span className="text-neutral-400 text-[11px] italic">No unboxing media attached</span>
                  )}
                </div>

                {/* Financial Context */}
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">Order Total</span>
                  <p className="font-mono text-base font-bold text-neutral-900">
                    ₹{ret.order?.amount?.toLocaleString("en-IN") || 0}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Payment: {ret.order?.razorpayPaymentId ? "CAPTURED (ONLINE)" : "PENDING"}
                  </p>
                  {ret.adminNotes && (
                    <p className="text-[11px] text-neutral-700 pt-1 border-t border-neutral-200">
                      <strong>Admin Notes: </strong> {ret.adminNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {ret.order?.items && ret.order.items.length > 0 && (
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {ret.order.items.length} apparel item(s) in this order
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {ret.status === "PENDING_REVIEW" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedReturn(ret);
                          setActionType("APPROVED");
                          setAdminNotes(ret.adminNotes || "");
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReturn(ret);
                          setActionType("REJECTED");
                          setAdminNotes(ret.adminNotes || "");
                        }}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
                      >
                        Reject Claim
                      </button>
                    </>
                  )}

                  {ret.status === "APPROVED" && (
                    <button
                      onClick={() => {
                        setSelectedReturn(ret);
                        setActionType("PICKUP_SCHEDULED");
                        setAdminNotes(ret.adminNotes || "");
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
                    >
                      Schedule Pickup
                    </button>
                  )}

                  {ret.status === "PICKUP_SCHEDULED" && (
                    <button
                      onClick={() => {
                        setSelectedReturn(ret);
                        setActionType("RECEIVED");
                        setAdminNotes(ret.adminNotes || "");
                      }}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
                    >
                      Mark Item Received (QC)
                    </button>
                  )}

                  <Link
                    href={`/admin/orders/${ret.orderId}`}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm"
                  >
                    Manage & Refund Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      {selectedReturn && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-mono">
                Confirm Return Action: {actionType.replace("_", " ")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedReturn(null);
                  setActionType(null);
                }}
                disabled={loading}
                className="text-neutral-400 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              You are about to mark Return #{selectedReturn.id.slice(-8)} as{" "}
              <strong className="text-neutral-900">{actionType.replace("_", " ")}</strong>. This updates the order tracking state and records your admin audit trail.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Admin Resolution Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Unboxing video verified defect, scheduling Delhivery reverse pickup, or rejection rationale."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReturn(null);
                    setActionType(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm disabled:opacity-50 ${
                    actionType === "REJECTED" ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-neutral-800"
                  }`}
                >
                  {loading ? "Processing..." : "Confirm & Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
