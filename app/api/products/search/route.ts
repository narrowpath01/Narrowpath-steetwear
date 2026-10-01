import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        status: { not: "DRAFT" },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { handle: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { collection: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        title: true,
        handle: true,
        collection: true,
        images: {
          take: 1,
          select: { url: true, altText: true }
        },
        variants: {
          take: 1,
          select: { price: true }
        }
      },
      take: 5
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
