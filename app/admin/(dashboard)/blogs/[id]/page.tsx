import React from "react";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    notFound();
  }

  return (
    <BlogEditor
      initialBlog={{
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        featuredImage: blog.featuredImage,
        category: blog.category,
        tags: blog.tags,
        authorName: blog.authorName,
        status: blog.status,
      }}
    />
  );
}
