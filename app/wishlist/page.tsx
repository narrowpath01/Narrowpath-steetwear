"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function WishlistPage() {
  const wishlistState = useWishlistStore((state) => state.items);
  const wishlist = Array.isArray(wishlistState) ? wishlistState : [];

  return (
    <div className="min-h-screen bg-white py-28 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center md:text-left mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Your Saved Items</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mt-2">
            Wishlist
          </h1>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <div className="space-y-2">
              <h3 className="text-lg font-bold uppercase tracking-wider text-neutral-800">Your wishlist is empty</h3>
              <p className="text-sm text-neutral-500 max-w-sm">
                Add your favorite Narrow Path heavyweight tees and printed designs here to keep track of them.
              </p>
            </div>
            <Link
              href="/shop"
              className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          /* Wishlist Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
