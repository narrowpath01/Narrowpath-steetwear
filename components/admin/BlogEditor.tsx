"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UploadCloudIcon,
  TrashIcon,
  EyeIcon,
  EditIcon,
  CheckIcon,
} from "./Icons";

interface BlogEditorProps {
  initialBlog?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featuredImage: string | null;
    category: string | null;
    tags: string | null;
    authorName: string | null;
    status: string;
  };
}

export function BlogEditor({ initialBlog }: BlogEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialBlog?.id);

  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || "");
  const [content, setContent] = useState(initialBlog?.content || "");
  const [featuredImage, setFeaturedImage] = useState(initialBlog?.featuredImage || "");
  const [category, setCategory] = useState(initialBlog?.category || "Editorial");
  const [tags, setTags] = useState(initialBlog?.tags || "");
  const [authorName, setAuthorName] = useState(initialBlog?.authorName || "Narrow Path Editorial Team");
  const [status, setStatus] = useState(initialBlog?.status || "DRAFT");

  const [viewMode, setViewMode] = useState<"write" | "preview">("write");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
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
      formData.append("folder", "blogs");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      setFeaturedImage(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (targetStatus?: string) => {
    const statusToSave = targetStatus || status;
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Article title is required.");
      return;
    }

    if (!slug.trim()) {
      setError("URL slug identifier is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        featuredImage: featuredImage.trim() || null,
        category: category.trim() || "Editorial",
        tags: tags.trim() || null,
        authorName: authorName.trim() || "Narrow Path Team",
        status: statusToSave,
      };

      const url = isEditing ? `/api/admin/blogs/${initialBlog!.id}` : "/api/admin/blogs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus(statusToSave);
      setSuccess(
        statusToSave === "PUBLISHED"
          ? "Article successfully published and live on customer storefront!"
          : "Article draft saved successfully."
      );

      router.push("/admin/blogs");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300 transition shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
              {isEditing ? "Edit Editorial Article" : "Draft Editorial Story"}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Long-form writing workspace for streetwear culture, drop stories, and styling guides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:text-black bg-white border border-neutral-300 hover:border-neutral-400 transition disabled:opacity-50 shadow-sm"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition disabled:opacity-50 shadow-sm"
          >
            {saving ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Title & Writing Studio (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Area */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. The Philosophy of Underground Streetwear: Acid Washes & Heavyweight Terry"
                className="w-full bg-transparent border-0 text-xl sm:text-2xl font-black text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 leading-tight"
              />
            </div>

            <div className="flex items-center text-xs">
              <span className="text-neutral-500 font-mono">/blogs/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(e.target.value);
                }}
                placeholder="e.g. underground-streetwear-philosophy"
                className="bg-transparent border-0 text-neutral-700 font-mono focus:outline-none p-0 ml-1 text-xs placeholder:text-neutral-400 font-semibold"
              />
            </div>

            <div>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="e.g. An exclusive breakdown of our signature 280 GSM cotton drops and raw garment dye process..."
                className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
          </div>

          {/* Featured Image Uploader */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Featured Cover Image (Cloudinary)
              </span>
              {featuredImage && (
                <button
                  type="button"
                  onClick={() => setFeaturedImage("")}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove Cover
                </button>
              )}
            </div>

            {featuredImage ? (
              <div className="relative rounded-xl overflow-hidden aspect-[21/9] border border-neutral-200">
                <img
                  src={featuredImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center bg-neutral-50">
                <UploadCloudIcon className="w-8 h-8 text-neutral-500 mb-2" />
                <span className="text-xs font-semibold text-neutral-700">
                  {uploadingImage ? "Uploading cover to Cloudinary..." : "Upload Cover Photography"}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1">
                  16:9 or 21:9 wide landscape visuals recommended
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Long-form Content Editor */}
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Story Content (Markdown Supported)
              </span>

              <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("write")}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                    viewMode === "write"
                      ? "bg-white text-neutral-900 shadow-sm font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                    viewMode === "preview"
                      ? "bg-white text-neutral-900 shadow-sm font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            {viewMode === "write" ? (
              <textarea
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your editorial story here...

## The Anatomy of the Heavyweight Drop
Streetwear is rooted in authentic expression and meticulous garment construction...

- 280 GSM Pure Combed French Terry Cotton
- Custom acid-washed pigment dye treatment
- Relaxed boxy streetwear silhouette
- High-density screen prints"
                className="w-full bg-white border border-neutral-300 rounded-lg p-4 text-sm font-sans text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black leading-relaxed font-mono transition"
              />
            ) : (
              <div className="min-h-[20rem] p-6 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-800 prose prose-neutral max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {content || <span className="text-neutral-400 italic">No content written yet.</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Controls (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Publication Settings
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-semibold"
              >
                <option value="DRAFT">DRAFT (Unpublished)</option>
                <option value="PUBLISHED">PUBLISHED (Visible to Public)</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="Editorial">Editorial</option>
                <option value="Drop Release">Drop Release</option>
                <option value="Lookbook">Lookbook</option>
                <option value="Culture & Music">Culture & Music</option>
                <option value="Styling Guide">Styling Guide</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Author
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Narrow Path Editorial Team"
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. streetwear, oversized-tees, acid-wash"
                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
