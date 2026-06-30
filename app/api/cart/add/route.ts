import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrCreateCartId } from "@/lib/cart";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId } = body;

    // Safely extract the string ID
    const safeVariantId = typeof variantId === 'string' ? variantId : variantId?.id;

    if (!safeVariantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const cartId = await getOrCreateCartId(session);

    // Now it is safe to upsert the CartItem because we know the Cart exists
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cartId,
          variantId: safeVariantId,
        }
      },
      update: {
        quantity: { increment: 1 }
      },
      create: {
        cartId: cartId,
        variantId: safeVariantId,
        quantity: 1,
      }
    });

    return NextResponse.json(cartItem, { status: 200 });

  } catch (error) {
    console.error("Failed to add to cart in DB:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
