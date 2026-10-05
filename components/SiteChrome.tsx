"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartInitializer from "@/components/CartInitializer";
import WishlistInitializer from "@/components/WishlistInitializer";
import NavigationLoader from "@/components/NavigationLoader";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
      <CartInitializer />
      <WishlistInitializer />
      <Suspense fallback={null}>
        <NavigationLoader />
      </Suspense>
    </>
  );
}
