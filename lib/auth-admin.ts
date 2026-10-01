import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

const OWNER_PHONE = process.env.WHATSAPP_OWNER_PHONE?.replace(/\D/g, "").slice(-10) || "9894781426";
const ADMIN_EMAILS = [
  "narrowpathtshirts@gmail.com",
  "pv254424@gmail.com",
  "kuhu.mishra98188@gmail.com",
  process.env.ADMIN_EMAIL,
].filter(Boolean) as string[];

export async function getAdminSession() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      return null;
    }

    // Check if role is ADMIN
    if (user.role === "ADMIN") {
      return { user, session };
    }

    // Check if user is owner phone or admin email -> auto elevate
    const isOwnerPhone = user.phone && user.phone.replace(/\D/g, "").slice(-10) === OWNER_PHONE;
    const isAdminEmail = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

    if (isOwnerPhone || isAdminEmail) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      return { user: { ...user, role: "ADMIN" }, session };
    }

    return null;
  } catch (error) {
    console.error("Admin verification error:", error);
    return null;
  }
}

export async function requireAdmin(redirectUrl = "/admin/login") {
  const adminData = await getAdminSession();
  if (!adminData) {
    redirect(redirectUrl);
  }
  return adminData;
}
