import React from "react";
import prisma from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Narrow Path — Editorial & Stories",
  description: "Underground streetwear culture, design stories, and drop announcements.",
};

export const dynamic = "force-dynamic";

export default async function BlogsIndexPage() {
  const blogs = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-neutral-400">
            Narrow Path Journal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Editorial & Culture
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Insights into underground garment production, heavy fabric curation, and creative direction.
          </p>
        </div>

        {/* Blog Posts Grid */}
        {blogs.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-500 font-mono">
            New editorial drops coming soon. Stay tuned.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-900 hover:border-neutral-700 transition"
              >
                {/* Cover Image */}
                <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative">
                  {blog.featuredImage ? (
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600 font-mono uppercase">
                      Editorial Story
                    </div>
                  )}
                  {blog.category && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] uppercase font-bold tracking-wider text-neutral-300 border border-neutral-800">
                      {blog.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block mb-1.5">
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                    <h2 className="text-base font-bold text-white group-hover:underline uppercase tracking-tight leading-snug">
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{blog.authorName || "Narrow Path"}</span>
                    <span className="group-hover:translate-x-1 transition text-white">
                      Read Article →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
