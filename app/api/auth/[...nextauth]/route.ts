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
      name: "Credentials",
      credentials: {
        contact: { label: "Contact", type: "text" },
        otp: { label: "OTP", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Admin Email & Password login
        if (credentials?.email && credentials?.password) {
          const email = credentials.email.trim().toLowerCase();
          const password = credentials.password;

          const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "narrowpathtshirts@gmail.com").toLowerCase();
          const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

          if (!ADMIN_PASSWORD) {
            console.error("[NextAuth]: ADMIN_PASSWORD environment variable is not configured.");
            throw new Error("Administrator authentication is temporarily unavailable.");
          }

          const envAdminEmails = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);

          const allowedAdminEmails = Array.from(new Set([ADMIN_EMAIL, ...envAdminEmails]));

          if (
            allowedAdminEmails.includes(email) &&
            password === ADMIN_PASSWORD
          ) {
            let user = await prisma.user.findFirst({
              where: { email },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  email,
                  name: "Narrow Path Admin",
                  role: "ADMIN",
                },
              });
            } else if (user.role !== "ADMIN") {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN" },
              });
            }

            return {
              id: user.id,
              name: user.name || "Narrow Path Admin",
              email: user.email,
              image: user.image,
              phone: user.phone,
              role: "ADMIN",
            };
          }

          throw new Error("Invalid administrator email or password.");
        }

        // 2. Customer Phone & OTP login
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
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone || token.phone || null;
        token.role = (user as any).role || "CUSTOMER";
      } else if (token.id && !token.role) {
        // Fallback: check role in DB
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.phone = (token.phone as string) || null;
        session.user.role = (token.role as string) || "CUSTOMER";
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