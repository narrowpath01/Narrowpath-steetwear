// components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  product: any; 
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url || "https://via.placeholder.com/400x500";
  // Always grab the first variant to use for the Quick Add
  const firstVariant = product.variants?.[0];
  const price = firstVariant?.price || 0;

  const { addItem, toggleCart } = useCartStore();

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // CRITICAL FIX: Pass the ID of the specific variant, NOT the product ID
    if (firstVariant?.id) {
      // Pass the visual data here too!
      addItem(firstVariant.id, {
        variantTitle: firstVariant.title,
        price: firstVariant.price,
        productTitle: product.title,
        image: imageUrl
      });
      toggleCart();
    } else {
      console.error("No variant found for this product");
    }
  };

  return (
    <Link href={`/products/${product.handle}`} className="group cursor-pointer block">
      <div className="relative w-full aspect-[3/4] bg-white mb-4 overflow-hidden rounded-2xl flex items-center justify-center border border-neutral-100/50">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl"
        />
      </div>
      
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-1 sm:pr-2">
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight text-black">
            {product.title}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-neutral-500">
            INR {price}
          </p>
        </div>

        <button 
          onClick={handleQuickAdd}
          className="p-1 sm:p-2 hover:opacity-50 transition-opacity flex items-center justify-center flex-shrink-0"
          aria-label="Add to cart"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="black" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </Link>
  );
}