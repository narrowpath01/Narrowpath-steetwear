import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    phone?: string | null;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phone?: string | null;
    role?: string | null;
  }
}