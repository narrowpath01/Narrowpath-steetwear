"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UploadCloudIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
} from "./Icons";

interface VariantForm {
  id?: string;
  title: string;
  price: number | string;
  sku?: string;
  inventory: number | string;
}

interface ImageForm {
  id?: string;
  url: string;
  altText?: string;
}

interface ProductEditorProps {
  initialProduct?: {
    id: string;
    title: string;
    handle: string;
    description: string;
    collection: string;
    status: string;
    isFeatured: boolean;
    images: ImageForm[];
    variants: VariantForm[];
  };
  categories: { name: string; slug: string }[];
}

export function ProductEditor({
  initialProduct,
  categories,
}: ProductEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct?.id);

  // Form states
  const [title, setTitle] = useState(initialProduct?.title || "");
  const [handle, setHandle] = useState(initialProduct?.handle || "");
  const [autoHandle, setAutoHandle] = useState(!isEditing);
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [collection, setCollection] = useState(initialProduct?.collection || "PRINTED");
  const [status, setStatus] = useState(initialProduct?.status || "ACTIVE");
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured || false);

  // Images state
  const [images, setImages] = useState<ImageForm[]>(initialProduct?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<VariantForm[]>(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants
      : [
          { title: "S", price: 1999, sku: "", inventory: 10 },
          { title: "M", price: 1999, sku: "", inventory: 15 },
          { title: "L", price: 1999, sku: "", inventory: 20 },
          { title: "XL", price: 1999, sku: "", inventory: 10 },
        ]
  );

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoHandle) {
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setHandle(generated);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image upload failed");

        setImages((prev) => [
          ...prev,
          { url: data.url, altText: title || file.name },
        ]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image to Cloudinary");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMakePrimary = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleAddVariant = () => {
    const basePrice = variants.length > 0 ? variants[0].price : 1999;
    setVariants((prev) => [
      ...prev,
      { title: "", price: basePrice, sku: "", inventory: 10 },
    ]);
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof VariantForm,
    val: any
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      setError("Product must have at least one variant.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkSetPrice = (priceVal: string) => {
    const num = Number(priceVal);
    if (!isNaN(num) && num >= 0) {
      setVariants((prev) => prev.map((v) => ({ ...v, price: num })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please provide a product title.");
      return;
    }

    if (!handle.trim()) {
      setError("Please provide a product handle/slug.");
      return;
    }

    if (variants.length === 0) {
      setError("At least one variant (e.g. Size 'M') is required.");
      return;
    }

    for (const v of variants) {
      if (!v.title.trim()) {
        setError("All variants must have a title (e.g. 'S', 'M', 'L').");
        return;
      }
      if (Number(v.price) < 0 || isNaN(Number(v.price))) {
        setError(`Variant "${v.title}" has an invalid price.`);
        return;
      }
      if (Number(v.inventory) < 0 || isNaN(Number(v.inventory))) {
        setError(`Variant "${v.title}" has an invalid inventory quantity.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        handle: handle.trim(),
        description: description.trim(),
        collection,
        status,
        isFeatured,
        images,
        variants: variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          title: v.title.trim(),
          price: Number(v.price),
          sku: v.sku?.trim() || null,
          inventory: Math.floor(Number(v.inventory)),
        })),
      };

      const url = isEditing
        ? `/api/admin/products/${initialProduct?.id}`
        : "/api/admin/products";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      setSuccess(
        isEditing
          ? "Product successfully updated!"
          : "Product created successfully! Redirecting..."
      );

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300 transition shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
              {isEditing ? `Edit: ${initialProduct?.title}` : "Create New Product"}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Set product attributes, upload Cloudinary photography, configure variants and stock.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-600 hover:text-black bg-white border border-neutral-200 hover:border-neutral-300 transition shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition shadow-sm disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Information & Media & Variants (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Basic Product Information */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Product Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Acid Wash Oversized Heavyweight Tee"
                required
                className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Product Handle / URL Slug *
                </label>
                <button
                  type="button"
                  onClick={() => setAutoHandle(!autoHandle)}
                  className="text-[11px] text-neutral-500 hover:text-black underline font-medium"
                >
                  {autoHandle ? "Customize slug" : "Auto-generate from title"}
                </button>
              </div>
              <div className="flex items-center">
                <span className="bg-neutral-100 border border-r-0 border-neutral-300 px-3 py-2.5 text-xs text-neutral-500 rounded-l-lg font-mono">
                  /product/
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    setAutoHandle(false);
                    setHandle(e.target.value);
                  }}
                  required
                  placeholder="e.g. acid-wash-heavyweight-tee"
                  className="w-full bg-white border border-neutral-300 rounded-r-lg px-3.5 py-2.5 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Product Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 280 GSM 100% French Terry Cotton, custom enzyme acid wash, relaxed dropped shoulders, ribbed crewneck collar..."
                className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition leading-relaxed shadow-sm"
              />
            </div>
          </div>

          {/* 2. Cloudinary Media Gallery */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Product Images (Cloudinary CDN)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  First image acts as primary storefront cover.
                </p>
              </div>
              <span className="text-xs text-neutral-500 font-mono font-semibold">
                {images.length} Image(s)
              </span>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-xl p-6 text-center transition cursor-pointer relative bg-neutral-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center">
                <UploadCloudIcon className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-xs font-bold text-neutral-700">
                  {uploadingImage
                    ? "Uploading image to Cloudinary CDN..."
                    : "Click to upload product photography or drag & drop"}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Supported: WebP, PNG, JPG, JPEG (High resolution)
                </p>
              </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 aspect-square shadow-sm"
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `Product Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black text-[9px] uppercase font-bold text-white shadow">
                        Primary
                      </span>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleMakePrimary(idx)}
                          className="px-2 py-1 rounded bg-white text-black text-[10px] font-bold shadow hover:bg-neutral-100 transition"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 rounded bg-red-600 text-white shadow hover:bg-red-700 transition"
                        title="Delete image"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Sizing Variants & Stock */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Variants & Inventory Ledger
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure apparel sizes, custom SKU identifiers, pricing, and stock count.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-200 transition shrink-0"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Variant Size</span>
              </button>
            </div>

            {/* Quick Bulk Price Setter */}
            <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <span className="font-semibold">Quick Set Base Price:</span>
              <input
                type="number"
                placeholder="1999"
                onBlur={(e) => handleBulkSetPrice(e.target.value)}
                className="w-24 bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-black"
              />
              <span className="text-[11px] text-neutral-400">(Applies to all variant rows)</span>
            </div>

            {/* Variant Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Size *</th>
                    <th className="py-2.5 px-3 font-semibold">SKU Identifier</th>
                    <th className="py-2.5 px-3 font-semibold">Price (₹) *</th>
                    <th className="py-2.5 px-3 font-semibold">Stock Units *</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/60">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={v.title}
                          onChange={(e) => handleUpdateVariant(idx, "title", e.target.value)}
                          placeholder="e.g. M"
                          required
                          className="w-20 bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-sans uppercase font-bold focus:outline-none focus:border-black"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={v.sku || ""}
                          onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                          placeholder="e.g. NP-TEE-BLK-M"
                          className="w-36 bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 uppercase focus:outline-none focus:border-black"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => handleUpdateVariant(idx, "price", e.target.value)}
                          placeholder="1999"
                          min="0"
                          step="1"
                          required
                          className="w-24 bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-bold focus:outline-none focus:border-black"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={v.inventory}
                          onChange={(e) => handleUpdateVariant(idx, "inventory", e.target.value)}
                          placeholder="15"
                          min="0"
                          step="1"
                          required
                          className="w-20 bg-white border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-neutral-900 font-bold focus:outline-none focus:border-black"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition"
                          title="Remove variant"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Organization & Publishing (1 Col) */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Publishing Status
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Storefront State
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-black shadow-sm"
              >
                <option value="ACTIVE">ACTIVE (Visible to customers)</option>
                <option value="DRAFT">DRAFT (Hidden / Work in Progress)</option>
                <option value="ARCHIVED">ARCHIVED (Discontinued)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    Featured Collection
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    Spotlight on homepage hero & drops section
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Collection / Category */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Catalog Category
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Select Collection
              </label>
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 uppercase font-semibold focus:outline-none focus:border-black shadow-sm"
              >
                <option value="PRINTED">PRINTED</option>
                <option value="MONOCHROME">MONOCHROME</option>
                <option value="OVERSIZED">OVERSIZED</option>
                <option value="ACCESSORIES">ACCESSORIES</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.name.toUpperCase()}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs space-y-2">
            <p className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">
              Summary Overview
            </p>
            <div className="flex justify-between">
              <span>Variant Sizing:</span>
              <span className="font-mono font-bold text-neutral-900">{variants.length} sizes</span>
            </div>
            <div className="flex justify-between">
              <span>Total Units Stock:</span>
              <span className="font-mono font-bold text-neutral-900">
                {variants.reduce((acc, v) => acc + (Number(v.inventory) || 0), 0)} units
              </span>
            </div>
            <div className="flex justify-between">
              <span>Photos Uploaded:</span>
              <span className="font-mono font-bold text-neutral-900">{images.length}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
