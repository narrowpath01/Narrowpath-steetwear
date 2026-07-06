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
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { handle: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { collection: { contains: query, mode: "insensitive" } }
        ]
      },
      include: {
        images: true,
        variants: true
      },
      take: 5
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
