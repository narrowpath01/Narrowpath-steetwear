import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrCreateCartId } from "@/lib/cart";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const cartId = await getOrCreateCartId(session);

    try {
      await prisma.cartItem.delete({
        where: { 
          cartId_variantId: {
            cartId: cartId,
            variantId: variantId,
          }
        }
      });
    } catch (error: any) {
      // P2025 means "Record to delete does not exist." 
      // If the user clicked Remove before the item was ever saved to the DB, 
      // we consider that a successful removal!
      if (error.code === 'P2025') {
        return NextResponse.json({ success: true }, { status: 200 });
      }
      throw error; // Rethrow actual crashes
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Failed to remove item from DB:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}