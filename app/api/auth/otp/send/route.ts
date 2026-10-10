// app/api/auth/otp/send/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendOtpWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { contact } = await req.json();
    if (!contact) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Clean and validate 10-digit Indian phone number
    const cleanPhone = contact.toString().replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }

    // Anti-spam cooldown: Check if an OTP was dispatched within the last 60 seconds
    const existingUser = await prisma.user.findFirst({
      where: { phone: cleanPhone },
      select: { otpExpires: true },
    });

    if (existingUser?.otpExpires) {
      const msRemaining = existingUser.otpExpires.getTime() - Date.now();
      // Total validity is 5 mins (300,000ms). If > 240,000ms remain, it was requested < 60s ago
      if (msRemaining > 240 * 1000) {
        const waitSec = Math.ceil((msRemaining - 240 * 1000) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSec} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    console.log(`\n=================================================`);
    console.log(`[PHONE OTP DISPATCH] Sending OTP ${otpCode} to +91 ${cleanPhone}`);
    console.log(`=================================================\n`);

    // 1. Find or create user by phone number
    await prisma.user.upsert({
      where: { phone: cleanPhone },
      update: {
        otpCode,
        otpExpires,
      },
      create: {
        phone: cleanPhone,
        name: `User ${cleanPhone.slice(-4)}`,
        otpCode,
        otpExpires,
      }
    });

    // 2. Dispatch real message via WhatsApp
    const whatsappResult = await sendOtpWhatsApp(cleanPhone, otpCode);

    return NextResponse.json({
      success: true,
      message: whatsappResult.success
        ? `Verification code sent to WhatsApp (+91 ${cleanPhone})`
        : `Verification code generated for +91 ${cleanPhone}`,
      ...(process.env.NODE_ENV !== "production" ? { code: otpCode } : {}),
    });

  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}

