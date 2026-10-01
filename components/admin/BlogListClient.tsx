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

export interface AdminBlogSummary {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  authorName: string | null;
  featuredImage: string | null;
}

interface BlogListClientProps {
  initialBlogs: AdminBlogSummary[];
}

export function BlogListClient({ initialBlogs }: BlogListClientProps) {
  const [blogs, setBlogs] = useState<AdminBlogSummary[]>(initialBlogs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      search === "" ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete article "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBlogs((prev) => prev.filter((b) => b.id !== id));
      setMessage({ text: `Article "${title}" deleted successfully.`, type: "success" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete article", type: "error" });
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
            Editorial CMS & Stories
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Publish lookbooks, underground streetwear culture articles, and release announcements.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition shrink-0 shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Write Article</span>
        </Link>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
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
            placeholder="Search articles by title, slug, or category..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
          />
        </div>

        <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs">
          {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
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

      {/* Articles Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No editorial articles found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Article</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Author</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Publish Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {filtered.map((blog) => {
                  return (
                    <tr key={blog.id} className="hover:bg-neutral-50/80 transition group">
                      {/* Title & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {blog.featuredImage ? (
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="w-12 h-12 object-cover rounded-lg bg-neutral-100 border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 text-xs font-mono shrink-0">
                              BLOG
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/blogs/${blog.id}`}
                              className="font-semibold text-neutral-900 hover:underline truncate block"
                            >
                              {blog.title}
                            </Link>
                            <span className="text-[10px] text-neutral-500 font-mono block">
                              /blogs/{blog.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-[10px] uppercase font-bold text-neutral-800">
                          {blog.category || "Editorial"}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        {blog.authorName || "Narrow Path Team"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            blog.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : blog.status === "DRAFT"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {blog.status}
                        </span>
                      </td>

                      {/* Publish Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Unpublished"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {blog.status === "PUBLISHED" && (
                            <Link
                              href={`/blogs/${blog.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition"
                              title="View Article on Website"
                            >
                              <ExternalLinkIcon className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <Link
                            href={`/admin/blogs/${blog.id}`}
                            className="p-1.5 text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition"
                            title="Edit Article"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(blog.id, blog.title)}
                            disabled={deletingId === blog.id}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                            title="Delete Article"
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
