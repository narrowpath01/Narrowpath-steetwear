import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/auth-admin";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    const validStatuses = ["PENDING_REVIEW", "APPROVED", "REJECTED", "PICKUP_SCHEDULED", "RECEIVED", "COMPLETED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const existingReturn = await prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existingReturn) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 });
    }

    const updatedReturn = await prisma.$transaction(async (tx) => {
      const ret = await tx.returnRequest.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(adminNotes !== undefined && { adminNotes }),
        },
      });

      // If approved or rejected, optionally update the order's status
      if (status === "APPROVED") {
        await tx.order.update({
          where: { id: existingReturn.orderId },
          data: { status: "RETURN_APPROVED" },
        });
      } else if (status === "REJECTED") {
        await tx.order.update({
          where: { id: existingReturn.orderId },
          data: { status: "DELIVERED" }, // Revert to delivered if return claim was rejected
        });
      } else if (status === "RECEIVED") {
        await tx.order.update({
          where: { id: existingReturn.orderId },
          data: { status: "RETURN_RECEIVED" },
        });
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          adminEmail: admin.user.email || admin.user.phone || "Admin",
          action: "RETURN_STATUS_UPDATE",
          resourceType: "ReturnRequest",
          resourceId: id,
          details: `Return status changed from ${existingReturn.status} to ${status || existingReturn.status}. Notes: ${adminNotes || "None"}`,
        },
      });

      return ret;
    });

    return NextResponse.json({ success: true, returnRequest: updatedReturn });
  } catch (error: any) {
    console.error("Return update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update return request" }, { status: 500 });
  }
}
