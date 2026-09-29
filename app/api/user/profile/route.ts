import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { name, email, phone } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (email !== undefined) dataToUpdate.email = email.trim().toLowerCase() || null;
    if (phone !== undefined) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      dataToUpdate.phone = cleanPhone.length === 10 ? cleanPhone : null;
    }

    // Check unique email conflict
    if (dataToUpdate.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: dataToUpdate.email,
          NOT: { id: userId },
        },
      });
      if (existingEmail) {
        return NextResponse.json({ error: "This email address is already linked to another account." }, { status: 400 });
      }
    }

    // Check unique phone conflict
    if (dataToUpdate.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: dataToUpdate.phone,
          NOT: { id: userId },
        },
      });
      if (existingPhone) {
        return NextResponse.json({ error: "This phone number is already linked to another account." }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
