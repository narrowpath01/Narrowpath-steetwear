// app/actions/cart.ts
"use server";

import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Helper function to get or create the Cart ID
async function getOrCreateCart() {
  const session = await getServerSession(authOptions);
  let cart;

  // 1. If Logged In: Find or create their permanent user cart by user.id or email
  const userId = session?.user?.id;
  if (userId || session?.user?.email) {
    const user = userId 
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: session.user.email! } });

    if (user) {
      cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } });
      return cart;
    }
  }


  // 2. If Anonymous: Rely on the Guest Cookie
  const cookieStore = await cookies();
  let guestId = cookieStore.get("np_guest_cart")?.value;

  if (!guestId) {
    // Brand new user: Generate a UUID and set a 30-day cookie
    guestId = uuidv4();
    cookieStore.set("np_guest_cart", guestId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true, // Secure against XSS attacks
    });
  }

  cart = await prisma.cart.findUnique({ where: { guestId } });
  if (!cart) cart = await prisma.cart.create({ data: { guestId } });

  return cart;
}

// Action: Fetch the entire cart with variant data
export async function fetchCart() {
  const cart = await getOrCreateCart();
  return prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      variant: {
        include: { product: { include: { images: { take: 1 } } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

// Action: Add Item to Database Cart
export async function addToCartDB(variantId: string) {
  const cart = await getOrCreateCart();

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } }
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + 1 }
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity: 1 }
    });
  }

  // Return the updated cart so the frontend can refresh instantly
  return fetchCart();
}

// Action: Remove Item completely
export async function removeFromCartDB(cartItemId: string) {
  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return fetchCart();
}

// Add this to the bottom of app/actions/cart.ts
export async function updateQuantityDB(cartItemId: string, quantity: number) {
  // If they reduce it to zero, just delete the item entirely
  if (quantity <= 0) {
    return removeFromCartDB(cartItemId);
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity }
  });

  // Return the fresh cart to sync the UI
  return fetchCart();
}