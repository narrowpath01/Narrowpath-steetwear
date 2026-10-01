import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";

export async function GET() {
  const adminData = await getAdminSession();
  if (!adminData) {
    return NextResponse.json({ isAdmin: false }, { status: 403 });
  }
  return NextResponse.json({
    isAdmin: true,
    user: {
      id: adminData.user.id,
      name: adminData.user.name,
      email: adminData.user.email,
      phone: adminData.user.phone,
      role: adminData.user.role,
    },
  });
}
