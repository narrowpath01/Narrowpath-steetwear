import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import CartDrawer from "@/components/CartDrawer";
import SessionProvider from "@/components/SessionProvider";
import { Footer } from "@/components/Footer"; 
import CartInitializer from "@/components/CartInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Narrow Path | Premium Streetwear",
  description: "Walk by faith, not by sight. Official store for Narrow Path.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* THE FIX: Added bg-neutral-50 text-black here for the global grey background */}
      <body className="min-h-full flex flex-col bg-neutral-50 text-black">
        <SessionProvider>
          <Navbar /> 
          <CartDrawer />
          {children}
          <Footer />
          <CartInitializer />
        </SessionProvider>
      </body>
    </html>
  );
}