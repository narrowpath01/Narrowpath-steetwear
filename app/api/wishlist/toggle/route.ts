import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // 1. Find or create wishlist for the user
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.user.id },
      });
    }

    // 2. Check if the item already exists in the wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: productId,
        },
      },
    });

    let added = false;

    if (existingItem) {
      // Delete if already wishlisted
      await prisma.wishlistItem.delete({
        where: {
          id: existingItem.id,
        },
      });
    } else {
      // Add if not wishlisted
      // First verify product exists
      const productExists = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!productExists) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: productId,
        },
      });
      added = true;
    }

    return NextResponse.json({ success: true, added }, { status: 200 });
  } catch (error) {
    console.error("Failed to toggle wishlist item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
