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

    const body = await request.json().catch(() => ({}));
    const productId = body?.productId;
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Valid productId is required" }, { status: 400 });
    }

    // 1. Verify user exists in DB
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // 2. Find or create wishlist for the user atomically using upsert
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // 3. Verify product exists
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!productExists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 4. Check if the item already exists in the wishlist
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
      // Add if not wishlisted using upsert for idempotency
      await prisma.wishlistItem.upsert({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId: productId,
          },
        },
        update: {},
        create: {
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
