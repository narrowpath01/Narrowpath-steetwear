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

    const products = wishlist ? wishlist.items.map((item) => item.product) : [];
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Sync localStorage productIds to database wishlist upon login
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productIds } = await request.json();
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: "Invalid productIds" }, { status: 400 });
    }

    // 1. Find or create user's wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.user.id },
      });
    }

    // 2. Add each productId to WishlistItem if not already present
    for (const productId of productIds) {
      // Ensure the product exists in the DB before wishlisting
      const productExists = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (productExists) {
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

    // 3. Fetch full updated wishlist items
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

    const products = updatedWishlist ? updatedWishlist.items.map((item) => item.product) : [];
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to sync wishlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
