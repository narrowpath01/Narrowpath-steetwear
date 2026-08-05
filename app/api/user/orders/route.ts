import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderQueryArgs = {
      where: {
        userId: session.user.id,
        status: { not: "PENDING" }
      },
      orderBy: { createdAt: "desc" as const }, // Newest orders first
      include: {
        returnRequest: true,
        items: {
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
        }
      }
    };

    let orders = await prisma.order.findMany(orderQueryArgs);

    // Sync active orders in the database with Delhivery's live status
    const activeOrders = orders.filter(
      (order) => order.awb && !["CANCELLED", "DELIVERED", "REFUNDED"].includes(order.status)
    );

    if (activeOrders.length > 0) {
      await Promise.all(
        activeOrders.map(async (order) => {
          try {
            const url = `https://track.delhivery.com/api/v1/packages/json/?waybill=${order.awb}`;
            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Authorization": `Token ${process.env.DELHIVERY_API_KEY}`,
                "Content-Type": "application/json",
              },
            });
            if (!response.ok) return;

            const data = await response.json();
            const shipment = data?.ShipmentData?.[0]?.Shipment;
            if (!shipment) return;

            const lowerStatus = (shipment.Status?.Status || "").toLowerCase();
            const lowerInstructions = (shipment.Status?.Instructions || "").toLowerCase();
            const statusCode = (shipment.Status?.StatusCode || "").toLowerCase();

            let dbStatus: string | null = null;
            let deliveredAt: Date | null = null;

            if (
              lowerStatus.includes("cancel") || 
              lowerStatus === "canc" || 
              lowerInstructions.includes("cancel") || 
              statusCode === "dtup-210"
            ) {
              dbStatus = "CANCELLED";
            } else if (lowerStatus === "delivered") {
              dbStatus = "DELIVERED";
              deliveredAt = new Date(shipment.Status?.StatusDateTime || new Date());
            } else if (
              lowerStatus.includes("rto") || 
              lowerStatus.includes("return") || 
              lowerInstructions.includes("rto") || 
              lowerInstructions.includes("return")
            ) {
              dbStatus = "CANCELLED";
            } else if (
              ["in transit", "dispatched", "out for delivery", "picked up"].includes(lowerStatus)
            ) {
              dbStatus = "SHIPPED";
            }

            if (dbStatus && order.status !== dbStatus) {
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  status: dbStatus,
                  ...(deliveredAt ? { deliveredAt } : {})
                }
              });
            }
          } catch (syncError) {
            console.error(`[Active Order Sync Error] for order ${order.id}:`, syncError);
          }
        })
      );

      // Fetch fresh records to reflect updated statuses on frontend
      orders = await prisma.order.findMany(orderQueryArgs);
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}