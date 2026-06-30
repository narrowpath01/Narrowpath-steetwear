"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function AddToCartForm({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  
  // 1. STRIPPED OUT isLoading - The store is now instant.
  const { addItem } = useCartStore();

  const handleAddToCart = async () => {
    addItem(selectedVariant.id); 
    useCartStore.getState().toggleCart();
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 block">Select Size</span>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((variant: any) => (
            <button 
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              disabled={variant.inventory <= 0}
              className={`border px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                selectedVariant.id === variant.id 
                  ? "border-black bg-black text-white" 
                  : "border-neutral-300 bg-white text-black hover:border-black"
              } ${variant.inventory <= 0 ? "opacity-30 cursor-not-allowed line-through" : ""}`}
            >
              {variant.title}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleAddToCart}
        // 2. STRIPPED OUT isLoading from disabled checks
        disabled={!selectedVariant}
        className="w-full bg-black text-white py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* 3. STRIPPED OUT the "ADDING..." ternary logic. The UI is instant now. */}
        Add to Cart — INR {selectedVariant?.price}
      </button>
    </div>
  );
}