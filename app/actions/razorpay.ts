// app/actions/razorpay.ts
"use server";

import Razorpay from "razorpay";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize the Razorpay SDK
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(cartTotal: number, items: any[]) {
  // 1. Authenticate User
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized: Please log in.");

  const userId = session.user.id;
  const user = userId 
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) throw new Error("User not found");


  // 2. Ask Razorpay to generate an Order ID
  const options = {
    amount: cartTotal * 100, // Razorpay requires amount in Paisa (multiply by 100)
    currency: "INR",
    receipt: `np_rcpt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  // 3. Save the PENDING order in your database using the Razorpay Order ID
  const dbOrder = await prisma.order.create({
    data: {
      userId: user.id,
      amount: cartTotal,
      status: "PENDING",
      razorpayOrderId: razorpayOrder.id,
      // Note: You will need to map your actual cart items to OrderItem creation here
    }
  });

  // 4. Return the order ID to the frontend
  return {
    orderId: razorpayOrder.id,
    currency: razorpayOrder.currency,
    amount: razorpayOrder.amount,
  };
}