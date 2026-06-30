import { cookies } from "next/headers";
import { Session } from "next-auth";
import prisma from "./db";
import crypto from "crypto";

export async function getOrCreateCartId(session: Session | null): Promise<string> {
  const cookieStore = await cookies();
  const guestCartId = cookieStore.get("cart_id")?.value;

  if (session?.user?.id) {
    const userId = session.user.id;

    // 1. Find or create user's cart in database
    let userCart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId },
      });
    }

    // 2. Merge guest cart items into user cart if a guest cart cookie exists
    if (guestCartId && guestCartId !== userCart.id) {
      try {
        const guestCartItems = await prisma.cartItem.findMany({
          where: { cartId: guestCartId },
        });

        for (const item of guestCartItems) {
          await prisma.cartItem.upsert({
            where: {
              cartId_variantId: {
                cartId: userCart.id,
                variantId: item.variantId,
              },
            },
            update: {
              quantity: { increment: item.quantity },
            },
            create: {
              cartId: userCart.id,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          });
        }

        // Clean up guest cart items and guest cart
        await prisma.cartItem.deleteMany({
          where: { cartId: guestCartId },
        });
        await prisma.cart.delete({
          where: { id: guestCartId },
        }).catch(() => {});
      } catch (err) {
        console.error("Error merging guest cart:", err);
      }

      // Clear the guest cart ID cookie as it's merged
      cookieStore.set("cart_id", "", { maxAge: 0, path: "/" });
    }

    return userCart.id;
  }

  // 3. Guest Flow
  if (guestCartId) {
    // Ensure the cart exists in DB
    await prisma.cart.upsert({
      where: { id: guestCartId },
      update: {},
      create: { id: guestCartId, guestId: guestCartId },
    });
    return guestCartId;
  }

  // Generate new guest cart ID
  const newGuestCartId = `guest_${crypto.randomUUID()}`;
  
  cookieStore.set("cart_id", newGuestCartId, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  await prisma.cart.create({
    data: { id: newGuestCartId, guestId: newGuestCartId },
  });

  return newGuestCartId;
}
