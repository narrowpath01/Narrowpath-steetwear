import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: any[]; // Array of full Product objects
  loadWishlist: () => Promise<void>;
  toggleWishlist: (product: any, session: any) => Promise<void>;
  syncWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      isWishlisted: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      loadWishlist: async () => {
        try {
          const response = await fetch("/api/wishlist");
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              set({ items: data });
            }
          }
        } catch (error) {
          console.error("Failed to load wishlist:", error);
        }
      },

      toggleWishlist: async (product: any, session: any) => {
        if (!product?.id) return;
        const previousItems = get().items || [];
        const isCurrentlyWishlisted = previousItems.some((item) => item.id === product.id);

        let newItems;
        if (isCurrentlyWishlisted) {
          newItems = previousItems.filter((item) => item.id !== product.id);
        } else {
          newItems = [...previousItems, product];
        }

        // Optimistically update UI
        set({ items: newItems });

        // If logged in, sync with database
        if (session?.user?.id) {
          try {
            const response = await fetch("/api/wishlist/toggle", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: product.id }),
            });

            if (!response.ok) {
              throw new Error("Database update failed");
            }
          } catch (error) {
            // Rollback on failure
            set({ items: previousItems });
            console.error("Database toggle failed, rolled back client wishlist:", error);
          }
        }
      },

      syncWishlist: async () => {
        const localItems = get().items || [];
        const productIds = localItems
          .map((item) => (typeof item === "string" ? item : item?.id))
          .filter((id): id is string => typeof id === "string" && id.trim().length > 0);

        try {
          const response = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds }),
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              set({ items: data });
            }
          }
        } catch (error) {
          console.error("Failed to sync client wishlist on login:", error);
        }
      },
    }),
    {
      name: "wishlist-storage", // localStorage key
    }
  )
);
