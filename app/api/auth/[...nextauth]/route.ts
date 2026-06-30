// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Required to support both Credentials (OTP) and OAuth providers concurrently
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
          throw new Error("Phone number/email and OTP code are required.");
        }

        const contact = credentials.contact.trim();
        const otp = credentials.otp.trim();

        // 1. Find user record in the DB
        const isEmail = contact.includes("@");
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: contact.toLowerCase() }
            : { phone: contact },
        });

        if (!user) {
          throw new Error("No user record found for this number or email.");
        }

        // 2. Validate OTP code matching
        if (!user.otpCode || user.otpCode !== otp) {
          throw new Error("Invalid verification code. Please try again.");
        }

        // 3. Validate OTP code expiration
        if (user.otpExpires && new Date() > user.otpExpires) {
          throw new Error("Verification code has expired. Please send a new one.");
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };