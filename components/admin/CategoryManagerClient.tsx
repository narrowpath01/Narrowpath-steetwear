"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  UploadCloudIcon,
  CheckIcon,
} from "./Icons";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  productCount: number;
}

interface CategoryManagerClientProps {
  initialCategories: AdminCategory[];
}

export function CategoryManagerClient({
  initialCategories,
}: CategoryManagerClientProps) {
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setIsActive(true);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setIsActive(cat.isActive);
    setError("");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "categories");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload category image");

      setImage(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        image: image.trim() || null,
        isActive,
      };

      if (editingCategory) {
        // Edit category
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? { ...c, ...data.category, productCount: c.productCount }
              : c
          )
        );
        setSuccess(`Category "${name}" updated successfully.`);
      } else {
        // Create category
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setCategories((prev) => [{ ...data.category, productCount: 0 }, ...prev]);
        setSuccess(`Category "${name}" created successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccess(`Category "${catName}" deleted successfully.`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Category Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Organize catalog apparel into collections, drops, and navigation categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition shrink-0 shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No categories defined yet. Create your first category above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Slug</th>
                  <th className="py-3.5 px-4 font-semibold">Description</th>
                  <th className="py-3.5 px-4 font-semibold">Linked Products</th>
                  <th className="py-3.5 px-4 font-semibold">Visibility</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                            {cat.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-neutral-900 uppercase tracking-wider">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-500">
                      /{cat.slug}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate">
                      {cat.description || "—"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-mono font-semibold">
                        {cat.productCount} product(s)
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          cat.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-neutral-100 text-neutral-500 border-neutral-200"
                        }`}
                      >
                        {cat.isActive ? "ACTIVE" : "HIDDEN"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition"
                          title="Edit Category"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                          title="Delete Category"
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

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-md"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Acid Wash Heavyweight Tees"
                  required
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Slug / URL Identifier *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. acid-wash-heavyweight-tees"
                  required
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Premium oversized luxury streetwear crafted from 280 GSM French Terry cotton..."
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>

              {/* Image Uploader */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Category Visual (Cloudinary)
                </label>
                <div className="flex items-center gap-3">
                  {image ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 border border-dashed border-neutral-300 hover:border-neutral-400 bg-neutral-50 rounded-lg p-3 text-center cursor-pointer transition flex items-center justify-center gap-2">
                    <UploadCloudIcon className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-600 font-medium">
                      {uploadingImage ? "Uploading..." : "Upload Category Visual"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
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
                    Active (visible in store navigation filters)
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
                  {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
