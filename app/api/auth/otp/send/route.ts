// app/api/auth/otp/send/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { contact } = await req.json();
    if (!contact) {
      return NextResponse.json({ error: "Phone number or email is required" }, { status: 400 });
    }

    // Clean and validate contact
    const isEmail = contact.includes("@");
    const formattedContact = contact.trim();

    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    console.log(`\n=================================================`);
    console.log(`[SMS/EMAIL OTP LOG] Sending OTP code ${otpCode} to ${formattedContact}`);
    console.log(`=================================================\n`);

    if (isEmail) {
      // Find or create user by email
      await prisma.user.upsert({
        where: { email: formattedContact.toLowerCase() },
        update: {
          otpCode,
          otpExpires,
        },
        create: {
          email: formattedContact.toLowerCase(),
          name: formattedContact.split("@")[0],
          otpCode,
          otpExpires,
        }
      });
    } else {
      // Find or create user by phone number
      await prisma.user.upsert({
        where: { phone: formattedContact },
        update: {
          otpCode,
          otpExpires,
        },
        create: {
          phone: formattedContact,
          name: `User ${formattedContact.slice(-4)}`,
          otpCode,
          otpExpires,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Include the code in the response so they can test/authenticate immediately
      code: otpCode,
    });

  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}
