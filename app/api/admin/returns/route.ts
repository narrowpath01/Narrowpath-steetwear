import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/auth-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentStatus: true,
              shippingStatus: true,
              razorpayPaymentId: true,
              createdAt: true,
              deliveredAt: true,
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              address: {
                select: { firstName: true, lastName: true, city: true, state: true, pinCode: true },
              },
              items: {
                include: {
                  variant: {
                    select: {
                      id: true,
                      title: true,
                      sku: true,
                      product: {
                        select: {
                          id: true,
                          title: true,
                          handle: true,
                          images: { take: 1, select: { url: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return NextResponse.json({
      returns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin returns fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch return requests" }, { status: 500 });
  }
}
