import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrCreateCartId } from "@/lib/cart";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cartId = await getOrCreateCartId(session);

    const cartItems = await prisma.cartItem.findMany({
      where: {
        cartId: cartId,
      },
      // Include the related variant and product data so your cart drawer can display images/titles
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(cartItems, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}