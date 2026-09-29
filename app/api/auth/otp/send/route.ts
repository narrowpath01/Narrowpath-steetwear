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

