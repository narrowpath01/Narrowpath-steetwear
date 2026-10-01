"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  DiscountIcon,
  XIcon,
  CheckIcon,
  CopyIcon,
} from "./Icons";

export interface AdminPromotion {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  isActive: boolean;
  startDate: string | Date | null;
  endDate: string | Date | null;
}

interface PromotionManagerClientProps {
  initialPromotions: AdminPromotion[];
}

export function PromotionManagerClient({
  initialPromotions,
}: PromotionManagerClientProps) {
  const [promotions, setPromotions] = useState<AdminPromotion[]>(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminPromotion | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number | string>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setCode("");
    setDescription("");
    setDiscountType("PERCENTAGE");
    setDiscountValue(15);
    setMinOrderAmount(0);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminPromotion) => {
    setEditingItem(item);
    setCode(item.code);
    setDescription(item.description || "");
    setDiscountType(item.discountType);
    setDiscountValue(item.discountValue);
    setMinOrderAmount(item.minOrderAmount || 0);
    setIsActive(item.isActive);
    setStartDate(item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : "");
    setEndDate(item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : "");
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPromotions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: data.promotion.isActive } : p))
      );
      setMessage({
        text: `Promo code ${data.promotion.code} is now ${data.promotion.isActive ? "ACTIVE" : "DISABLED"}`,
        type: "success",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to toggle promotion", type: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage({ text: "Promo code name is required.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      if (editingItem) {
        const res = await fetch(`/api/admin/promotions/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setPromotions((prev) =>
          prev.map((p) => (p.id === editingItem.id ? data.promotion : p))
        );
        setMessage({ text: `Code ${data.promotion.code} updated successfully.`, type: "success" });
      } else {
        const res = await fetch("/api/admin/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setPromotions((prev) => [data.promotion, ...prev]);
        setMessage({ text: `Promo code ${data.promotion.code} created!`, type: "success" });
      }

      setIsModalOpen(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message || "Operation failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, promoCode: string) => {
    if (!confirm(`Are you sure you want to delete promo code ${promoCode}?`)) return;

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPromotions((prev) => prev.filter((p) => p.id !== id));
      setMessage({ text: `Code ${promoCode} deleted.`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete code", type: "error" });
    }
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setMessage({ text: `Coupon "${c}" copied to clipboard!`, type: "success" });
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Discounts & Promo Codes
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Create coupon codes, percentage discounts, and order value promotions for customer checkout.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition shrink-0 shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
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
          ) : null}
          <span>{message.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {promotions.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No active coupon codes created yet. Create your first promotion above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Coupon Code</th>
                  <th className="py-3.5 px-4 font-semibold">Benefit</th>
                  <th className="py-3.5 px-4 font-semibold">Min Order Requirement</th>
                  <th className="py-3.5 px-4 font-semibold">Validity</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {promotions.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <DiscountIcon className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="font-mono font-bold text-neutral-900 text-xs tracking-wider">
                          {item.code}
                        </span>
                        <button
                          onClick={() => copyCode(item.code)}
                          className="text-neutral-400 hover:text-black p-0.5"
                          title="Copy Code"
                        >
                          <CopyIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.description && (
                        <span className="text-[11px] text-neutral-500 block pl-6 mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200 font-mono font-bold text-neutral-900 text-xs">
                        {item.discountType === "PERCENTAGE"
                          ? `${item.discountValue}% OFF`
                          : `₹${item.discountValue} FLAT OFF`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {item.minOrderAmount && item.minOrderAmount > 0
                        ? `₹${item.minOrderAmount.toLocaleString("en-IN")}`
                        : "No minimum order"}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                      {item.startDate || item.endDate ? (
                        <span>
                          {item.startDate ? new Date(item.startDate).toLocaleDateString("en-IN") : "Now"}
                          {" → "}
                          {item.endDate ? new Date(item.endDate).toLocaleDateString("en-IN") : "Evergreen"}
                        </span>
                      ) : (
                        <span>Always Valid</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id)}
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border transition ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200"
                        }`}
                      >
                        {item.isActive ? "ACTIVE & LIVE" : "PAUSED"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition"
                          title="Edit Code"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.code)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                          title="Delete Code"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                {editingItem ? "Edit Promo Code" : "Create New Promo Code"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-md"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NARROW20 or DROPFIRST"
                  required
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs font-mono font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black uppercase tracking-wider transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% off for first-time customers on orders above ₹999"
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (INR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="e.g. 20"
                    required
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="e.g. 999 (0 for no minimum threshold)"
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Valid From (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Active & Redeemable at Checkout
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Saving..." : editingItem ? "Save Changes" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
