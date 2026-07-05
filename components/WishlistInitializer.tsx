"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function WishlistInitializer() {
  const { status } = useSession();
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);
  const syncWishlist = useWishlistStore((state) => state.syncWishlist);
  const prevStatus = useRef(status);

  useEffect(() => {
    if (status === "authenticated") {
      // Sync client-side localStorage wishlist to DB when transitioning to authenticated
      if (prevStatus.current !== "authenticated") {
        syncWishlist();
      } else {
        loadWishlist();
      }
    }
    prevStatus.current = status;
  }, [status, syncWishlist, loadWishlist]);

  return null;
}
