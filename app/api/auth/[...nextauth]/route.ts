// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Define and export the options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
    session: {
    strategy: "database", 
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

// 2. Pass the options to the NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };