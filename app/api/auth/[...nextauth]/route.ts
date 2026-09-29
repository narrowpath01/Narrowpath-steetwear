// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Required to support both Credentials (OTP) and OAuth providers concurrently
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "OTP",
      credentials: {
        contact: { label: "Contact", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.contact || !credentials?.otp) {
          throw new Error("Phone number and verification code are required.");
        }

        const rawContact = credentials.contact.trim();
        const otp = credentials.otp.trim();

        // Standardize to 10-digit Indian phone number
        const cleanPhone = rawContact.replace(/\D/g, "").slice(-10);
        if (cleanPhone.length !== 10) {
          throw new Error("Please provide a valid 10-digit mobile number.");
        }

        // 1. Find user record in the DB
        const user = await prisma.user.findFirst({
          where: { phone: cleanPhone },
        });

        if (!user) {
          throw new Error("No user record found for this number.");
        }

        // 2. Validate OTP code matching
        if (!user.otpCode || user.otpCode !== otp) {
          throw new Error("Invalid verification code. Please try again.");
        }

        // 3. Validate OTP code expiration
        if (user.otpExpires && new Date() > user.otpExpires) {
          throw new Error("Verification code has expired. Please request a new one.");
        }

        // 4. Burn the OTP code to prevent replay attacks
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otpCode: null,
            otpExpires: null,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone || token.phone || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.phone = (token.phone as string) || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // invalid URL fallback
      }
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };