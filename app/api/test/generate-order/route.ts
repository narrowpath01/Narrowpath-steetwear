import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  // STRICT SECURITY: Ensure this only works in development mode.
  // You do NOT want users generating fake orders in production.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in to generate a test order." }, { status: 401 });
    }

    // 1. Find or create an address for the user (needed for Delhivery reverse pickup)
    let address = await prisma.address.findFirst({
      where: { userId: session.user.id }
    });

    if (!address) {
      address = await prisma.address.create({
        data: {
          userId: session.user.id,
          firstName: "Test",
          lastName: "User",
          email: session.user.email || "test@test.com",
          phoneNumber: "9999999999",
          street: "123 Fake Street",
          city: "New Delhi",
          state: "Delhi",
          pinCode: "110001",
          country: "IN",
        }
      });
    }

    // 2. Create the Mock Order
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mockOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        amount: 2500,
        status: "DELIVERED",
        awb: "1234567890123", // A fake waybill
        shippingStatus: "DELIVERED",
        addressId: address.id,
        deliveredAt: yesterday, // Delivered yesterday so it passes the 3-day rule
        razorpayOrderId: `mock_rzp_${Date.now()}`,
        razorpayPaymentId: `mock_pay_${Date.now()}`,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Mock order generated successfully. Check your Orders page.",
      orderId: mockOrder.id 
    });

  } catch (error: any) {
    console.error("Mock Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}