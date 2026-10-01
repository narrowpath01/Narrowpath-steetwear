import React from "react";
import prisma from "@/lib/db";
import { BlogListClient } from "@/components/admin/BlogListClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <BlogListClient initialBlogs={blogs} />;
}
