import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : session.user.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;
    
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


    // Check if an identical physical address already exists for the user (case-insensitive and trimmed)
    const existingAddress = await prisma.address.findFirst({
      where: {
        userId: user.id,
        street: { equals: street.trim(), mode: 'insensitive' },
        city: { equals: city.trim(), mode: 'insensitive' },
        state: { equals: state.trim(), mode: 'insensitive' },
        pinCode: { equals: pinCode.trim(), mode: 'insensitive' },
      }
    });

    if (existingAddress) {
      console.log("[Addresses API] Found existing matching address ID:", existingAddress.id);
      const updatedAddress = await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          firstName,
          lastName,
          phoneNumber: phoneNumber || existingAddress.phoneNumber,
          email: session.user.email || "",
        }
      });
      return NextResponse.json(updatedAddress, { status: 200 });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phoneNumber,
        email: session.user.email || "",
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
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
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json([], { status: 401 });

    const userId = session.user.id;
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : session.user.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;

    if (!user) return NextResponse.json([], { status: 404 });

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Deduplicate on-the-fly by normalized street, city, state, pinCode to clean up duplicates from the UI
    const seen = new Set<string>();
    const uniqueAddresses = addresses.filter((addr) => {
      const key = `${addr.street.trim().toLowerCase()}|${addr.city.trim().toLowerCase()}|${addr.state.trim().toLowerCase()}|${addr.pinCode.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(uniqueAddresses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : session.user.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Grab the ID from the URL (e.g., /api/user/addresses?id=123)
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ error: "Missing address ID" }, { status: 400 });
    }

    // 2. Verify ownership before deleting
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== user.id) {
      return NextResponse.json({ error: "Address not found or unauthorized" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}