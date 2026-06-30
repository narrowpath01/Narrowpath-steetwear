import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("DEBUG: Current Session Object:", session); 
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { street, city, state, pinCode, phoneNumber } = body;

    if (!street || !city || !pinCode) {
      return NextResponse.json({ error: "Missing address fields" }, { status: 400 });
    }

    const fullName = session.user?.name ?? "User";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";


    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phoneNumber,
        email: session.user.email || "",
        street,
        city,
        state,
        pinCode,
      }
    });

    return NextResponse.json(newAddress, { status: 200 });

  } catch (error) {
    console.error("Failed to save address:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // FIXED: authOptions is now passed to the GET request too
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json([], { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json([], { status: 404 });

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(addresses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Grab the ID from the URL (e.g., /api/user/addresses?id=123)
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ error: "Missing address ID" }, { status: 400 });
    }

    // 2. Delete the address from the Postgres database
    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}