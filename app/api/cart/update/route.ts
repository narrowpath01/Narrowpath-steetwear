import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrCreateCartId } from "@/lib/cart";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { variantId, quantity } = body;

    if (!variantId || typeof quantity !== 'number') {
      return NextResponse.json({ error: "Valid variant ID and quantity are required" }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const cartId = await getOrCreateCartId(session);

    // RACE CONDITION FIX: Use Upsert. If they clicked "+" before the "Add" route 
    // finished processing, this will catch it and create the item safely.
    const updatedItem = await prisma.cartItem.upsert({
      where: { 
        cartId_variantId: {
          cartId: cartId,
          variantId: variantId,
        }
      },
      update: { 
        quantity: quantity 
      },
      create: {
        cartId: cartId,
        variantId: variantId,
        quantity: quantity,
      }
    });

    return NextResponse.json(updatedItem, { status: 200 });

  } catch (error) {
    console.error("Failed to update quantity in DB:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}