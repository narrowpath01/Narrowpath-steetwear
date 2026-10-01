import React, { cache } from "react";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

export const revalidate = 60;

const getBlogBySlug = cache(async (slug: string) => {
  return prisma.blog.findUnique({
    where: { slug },
  });
});

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return { title: "Article Not Found — Narrow Path" };
  }

  return {
    title: `${blog.title} — Narrow Path Editorial`,
    description: blog.excerpt || "Underground streetwear culture and design stories.",
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "PUBLISHED") {
    notFound();
  }

  // Safe markdown-style line rendering to prevent XSS
  const paragraphs = blog.content.split(/\n\n+/);

  return (
    <article className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition uppercase font-mono tracking-wider"
        >
          ← Back to Stories
        </Link>

        {/* Header Metadata */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
            {blog.category && (
              <span className="px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 uppercase font-bold text-[10px]">
                {blog.category}
              </span>
            )}
            <span>•</span>
            <span>
              {blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Recent"}
            </span>
            <span>•</span>
            <span>By {blog.authorName || "Narrow Path Team"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </div>

        {/* Cover Photo */}
        {blog.featuredImage && (
          <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-neutral-800 bg-neutral-950">
            <img
              src={getOptimizedCloudinaryUrl(blog.featuredImage, { width: 1200 })}
              alt={blog.title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Body */}
        <div className="pt-6 border-t border-neutral-900 space-y-6 text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
          {paragraphs.map((para, index) => {
            const trimmed = para.trim();
            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white pt-4"
                >
                  {trimmed.replace("## ", "")}
                </h2>
              );
            }
            if (trimmed.startsWith("# ")) {
              return (
                <h2
                  key={index}
                  className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white pt-6"
                >
                  {trimmed.replace("# ", "")}
                </h2>
              );
            }
            if (trimmed.startsWith("- ")) {
              const items = trimmed.split("\n").filter(Boolean);
              return (
                <ul key={index} className="list-disc list-inside space-y-1 text-neutral-300">
                  {items.map((it, i) => (
                    <li key={i}>{it.replace(/^-\s*/, "")}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="text-neutral-300">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {blog.tags && (
          <div className="pt-8 border-t border-neutral-900 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-neutral-500 font-mono">Tags:</span>
            {blog.tags.split(",").map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 font-mono"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
