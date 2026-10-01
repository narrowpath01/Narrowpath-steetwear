"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SearchIcon,
  PlusIcon,
  ExternalLinkIcon,
  EditIcon,
  TrashIcon,
} from "./Icons";

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  sku: string | null;
  inventory: number;
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  collection: string;
  status: string;
  isFeatured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  images: ProductImage[];
  variants: ProductVariant[];
}

interface ProductListClientProps {
  initialProducts: AdminProduct[];
  collections: string[];
}

export function ProductListClient({
  initialProducts,
  collections,
}: ProductListClientProps) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [collectionFilter, setCollectionFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.handle.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some((v) => v.sku?.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" || p.status === statusFilter;

    const matchesCollection =
      collectionFilter === "ALL" || p.collection === collectionFilter;

    return matchesSearch && matchesStatus && matchesCollection;
  });

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/featured`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFeatured: data.isFeatured } : p))
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to update featured status");
      setTimeout(() => setActionError(""), 4000);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      setActionSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update status");
      setTimeout(() => setActionError(""), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? If historical orders reference it, it will be safely archived instead.")) {
      return;
    }

    setDeletingId(id);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.archived) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "ARCHIVED" } : p))
        );
        setActionSuccess(data.message);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setActionSuccess("Product successfully deleted from catalog.");
      }
      setTimeout(() => setActionSuccess(""), 5000);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete product");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Catalog Products
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your apparel catalog, sizing variants, inventory, and storefront status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Product</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {actionSuccess}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, handle, or SKU..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs">
            {["ALL", "ACTIVE", "DRAFT", "ARCHIVED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                  statusFilter === s
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Collection Filter */}
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="bg-white border border-neutral-300 text-neutral-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-black shadow-sm"
          >
            <option value="ALL">All Collections</option>
            {collections.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-neutral-600">No products found</p>
            <p className="text-xs text-neutral-400 mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Collection</th>
                  <th className="py-3.5 px-4 font-semibold">Pricing</th>
                  <th className="py-3.5 px-4 font-semibold">Inventory</th>
                  <th className="py-3.5 px-4 font-semibold">Featured</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredProducts.map((product) => {
                  const image = product.images[0]?.url || "/placeholder.png";
                  const totalInventory = product.variants.reduce(
                    (acc, v) => acc + v.inventory,
                    0
                  );
                  const minPrice = Math.min(...product.variants.map((v) => v.price), 0);
                  const maxPrice = Math.max(...product.variants.map((v) => v.price), 0);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50/70 transition group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={image}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-semibold text-neutral-900 hover:underline truncate block"
                            >
                              {product.title}
                            </Link>
                            <span className="text-[11px] text-neutral-400 font-mono block">
                              /{product.handle}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Collection */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-[10px] uppercase font-bold text-neutral-700">
                          {product.collection}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                        {minPrice === maxPrice ? (
                          `₹${minPrice.toLocaleString("en-IN")}`
                        ) : (
                          `₹${minPrice.toLocaleString("en-IN")} - ₹${maxPrice.toLocaleString("en-IN")}`
                        )}
                      </td>

                      {/* Inventory breakdown */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono border ${
                              totalInventory === 0
                                ? "bg-red-50 text-red-700 border-red-200"
                                : totalInventory <= 5
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {totalInventory} units
                          </span>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {product.variants.map((v) => `${v.title}:${v.inventory}`).join(" ")}
                          </p>
                        </div>
                      </td>

                      {/* Featured Star */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                          title={product.isFeatured ? "Featured on Home" : "Not Featured"}
                          className={`p-1.5 rounded-md transition ${
                            product.isFeatured
                              ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                              : "text-neutral-300 hover:text-neutral-500"
                          }`}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={product.status}
                          onChange={(e) => handleStatusChange(product.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase rounded px-2 py-1 border focus:outline-none transition ${
                            product.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : product.status === "DRAFT"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/product/${product.handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Customer Store"
                            className="p-1.5 text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition"
                          >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/admin/products/${product.id}`}
                            title="Edit Product"
                            className="p-1.5 text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            title="Delete Product"
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition disabled:opacity-40"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
