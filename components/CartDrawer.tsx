// components/CartDrawer.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

export default function CartDrawer() {
  // FIX 1: Changed `isOpen` to `isCartOpen` to match the Zustand store
  const { isCartOpen, toggleCart, items, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {/* FIX 2: Check for `isCartOpen` instead of `isOpen` */}
      {isCartOpen && (
        <>
          {/* THE OVERLAY: Z-index set to 990 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 z-[990] backdrop-blur-sm"
          />

          {/* THE DRAWER: Z-index set to 1000 to crush all other elements */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white text-black z-[1000] shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-200">
              <h2 className="text-xl font-black uppercase tracking-widest">Your Cart</h2>
              <button onClick={toggleCart} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="font-medium uppercase tracking-widest text-sm">Your cart is empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-neutral-100 pb-6">
                      <div className="relative w-24 aspect-[3/4] bg-neutral-100">
                        {/* Drill down into the relational Prisma object for the image */}
                        {item.variant?.product?.images?.[0]?.url && (
                          <Image
                            src={getOptimizedCloudinaryUrl(item.variant.product.images[0].url, { width: 240 })}
                            alt={item.variant.product.title || "Product image"}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Drill down for title and variant name */}
                          <h3 className="font-bold text-sm uppercase tracking-wide text-black">
                            {item.variant?.product?.title}
                          </h3>
                          <p className="text-xs text-neutral-500 uppercase mt-1">
                            Size: {item.variant?.title}
                          </p>
                          <p className="text-neutral-500 text-sm mt-1 font-medium">
                            ₹{item.variant?.price}
                          </p>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="flex items-center border border-neutral-200">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-neutral-100 text-black">-</button>
                            <span className="px-3 text-sm font-medium text-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-neutral-100 text-black">+</button>
                          </div>

                          <button onClick={() => removeItem(item.id)} className="text-xs uppercase font-bold text-neutral-400 hover:text-black underline underline-offset-4">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold uppercase tracking-widest text-sm text-neutral-500">Subtotal</span>
                  <span className="text-xl font-black text-black">
                    {items[0].currency} {totalPrice()}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mb-6 text-center">Shipping and taxes calculated at checkout.</p>
                <Link
                  href="/checkout"
                  // FIX 3: Changed `isOpen` to `isCartOpen` here as well
                  onClick={() => useCartStore.setState({ isCartOpen: false })}
                  className="w-full bg-black text-white py-5 rounded-full flex justify-center font-bold uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}