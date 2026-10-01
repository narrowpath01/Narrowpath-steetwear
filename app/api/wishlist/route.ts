import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch authenticated user's wishlist products
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
              },
            },
          },
        },
      },
    });

    const products = wishlist
      ? wishlist.items
          .filter((item) => item.product)
          .map((item) => item.product)
      : [];
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST: Sync localStorage productIds to database wishlist upon login
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify user exists in DB before attempting relational mutations
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json([], { status: 200 });
    }

    const body = await request.json().catch(() => ({}));
    const productIds = body?.productIds;
    const validProductIds: string[] = Array.isArray(productIds)
      ? productIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [];

    // 2. Find or create user's wishlist atomically using upsert (prevents concurrency race conditions)
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // 3. Add each valid productId to WishlistItem if product exists
    if (validProductIds.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: validProductIds } },
        select: { id: true },
      });
      const validDbIds = existingProducts.map((p) => p.id);

      for (const productId of validDbIds) {
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
      }
    }

    // 4. Fetch full updated wishlist items
    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
              },
            },
          },
        },
      },
    });

    const products = updatedWishlist
      ? updatedWishlist.items
          .filter((item) => item.product)
          .map((item) => item.product)
      : [];
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to sync wishlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
