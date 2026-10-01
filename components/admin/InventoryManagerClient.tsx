"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SearchIcon,
  CheckIcon,
  AlertCircleIcon,
} from "./Icons";

export interface InventoryItem {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  inventory: number;
  product: {
    id: string;
    title: string;
    handle: string;
    collection: string;
    updatedAt: string | Date;
    images: { url: string }[];
  };
}

interface InventoryManagerClientProps {
  initialVariants: InventoryItem[];
}

export function InventoryManagerClient({
  initialVariants,
}: InventoryManagerClientProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialVariants);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [editingValues, setEditingValues] = useState<{ [variantId: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: "success" | "error" } | null>(null);

  // Filtered variants
  const filtered = items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.product.title.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      filter === "ALL"
        ? true
        : filter === "OUT_OF_STOCK"
        ? item.inventory === 0
        : filter === "LOW_STOCK"
        ? item.inventory > 0 && item.inventory <= 5
        : item.inventory > 5;

    return matchesSearch && matchesStatus;
  });

  const getStockValue = (variantId: string, current: number) => {
    return editingValues[variantId] !== undefined ? editingValues[variantId] : current;
  };

  const handleStockInputChange = (variantId: string, value: string) => {
    const num = parseInt(value, 10);
    setEditingValues((prev) => ({
      ...prev,
      [variantId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleQuickAdjust = (variantId: string, current: number, delta: number) => {
    const val = getStockValue(variantId, current);
    const updated = Math.max(0, val + delta);
    setEditingValues((prev) => ({
      ...prev,
      [variantId]: updated,
    }));
  };

  const handleSaveStock = async (variantId: string, current: number) => {
    const targetInventory = getStockValue(variantId, current);
    if (targetInventory === current) return;

    setSavingId(variantId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, inventory: targetInventory }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update in local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === variantId ? { ...i, inventory: data.variant.inventory } : i
        )
      );

      // Clear dirty map
      setEditingValues((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });

      setFeedback({ id: variantId, msg: "Stock updated successfully", type: "success" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ id: variantId, msg: err.message || "Failed to update", type: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const totalUnits = items.reduce((acc, i) => acc + i.inventory, 0);
  const outOfStockCount = items.filter((i) => i.inventory === 0).length;
  const lowStockCount = items.filter((i) => i.inventory > 0 && i.inventory <= 5).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time apparel inventory ledger, SKU level stock allocation, and restock controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm text-xs">
            <span className="text-neutral-500">Total Units in Stock: </span>
            <span className="font-bold text-neutral-900 font-mono">{totalUnits}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter("OUT_OF_STOCK")}
          className={`p-4 rounded-xl border transition cursor-pointer shadow-sm ${
            filter === "OUT_OF_STOCK"
              ? "bg-red-50 border-red-300 ring-1 ring-red-400"
              : "bg-white border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 font-medium">Out of Stock</span>
            <AlertCircleIcon className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2 font-mono">
            {outOfStockCount}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Variants with 0 units</p>
        </div>

        <div
          onClick={() => setFilter("LOW_STOCK")}
          className={`p-4 rounded-xl border transition cursor-pointer shadow-sm ${
            filter === "LOW_STOCK"
              ? "bg-amber-50 border-amber-300 ring-1 ring-amber-400"
              : "bg-white border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 font-medium">Low Stock Warning</span>
            <AlertCircleIcon className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2 font-mono">
            {lowStockCount}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Variants with 1 to 5 units</p>
        </div>

        <div
          onClick={() => setFilter("IN_STOCK")}
          className={`p-4 rounded-xl border transition cursor-pointer shadow-sm ${
            filter === "IN_STOCK"
              ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
              : "bg-white border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 font-medium">Healthy Inventory</span>
            <CheckIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            {items.length - outOfStockCount - lowStockCount}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Variants with &gt; 5 units</p>
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
            placeholder="Search by product title, size (e.g. S, M, XL), or SKU..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
          />
        </div>

        <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs">
          {(["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                filter === s
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No inventory variants match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Size Variant</th>
                  <th className="py-3.5 px-4 font-semibold">SKU</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Stock Status</th>
                  <th className="py-3.5 px-4 font-semibold">Inventory Adjustment</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {filtered.map((item) => {
                  const image = item.product.images[0]?.url || "/placeholder.png";
                  const currentValue = getStockValue(item.id, item.inventory);
                  const isDirty = currentValue !== item.inventory;
                  const itemFeedback = feedback?.id === item.id ? feedback : null;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/80 transition">
                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={image}
                            alt={item.product.title}
                            className="w-10 h-10 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${item.product.id}`}
                              className="font-semibold text-neutral-900 hover:underline truncate block"
                            >
                              {item.product.title}
                            </Link>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                              {item.product.collection}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Variant Size */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-900 uppercase font-mono">
                          {item.title}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-neutral-500">
                        {item.sku || "—"}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold font-mono border ${
                            item.inventory === 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : item.inventory <= 5
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {item.inventory === 0
                            ? "OUT OF STOCK"
                            : item.inventory <= 5
                            ? `LOW STOCK (${item.inventory})`
                            : `IN STOCK (${item.inventory})`}
                        </span>
                      </td>

                      {/* Quick Adjust and Direct Edit */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, item.inventory, -5)}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded text-[11px] font-mono font-bold text-neutral-700 transition"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, item.inventory, -1)}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded text-[11px] font-mono font-bold text-neutral-700 transition"
                          >
                            -1
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentValue}
                            onChange={(e) => handleStockInputChange(item.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveStock(item.id, item.inventory);
                              }
                            }}
                            className={`w-20 px-2 py-1 border rounded text-xs text-center font-mono font-bold transition focus:outline-none ${
                              isDirty
                                ? "border-amber-400 bg-amber-50 text-amber-800 ring-1 ring-amber-400"
                                : "border-neutral-300 bg-white text-neutral-900 focus:border-black focus:ring-1 focus:ring-black"
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, item.inventory, 1)}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded text-[11px] font-mono font-bold text-neutral-700 transition"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.id, item.inventory, 5)}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded text-[11px] font-mono font-bold text-neutral-700 transition"
                          >
                            +5
                          </button>
                        </div>

                        {itemFeedback && (
                          <p
                            className={`text-[10px] mt-1 font-medium ${
                              itemFeedback.type === "success"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {itemFeedback.msg}
                          </p>
                        )}
                      </td>

                      {/* Save Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isDirty ? (
                          <button
                            type="button"
                            onClick={() => handleSaveStock(item.id, item.inventory)}
                            disabled={savingId === item.id}
                            className="px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase transition disabled:opacity-50 shadow-sm"
                          >
                            {savingId === item.id ? "Saving..." : "Save"}
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            Synced
                          </span>
                        )}
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
