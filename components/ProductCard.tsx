// components/ProductCard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSession } from "next-auth/react";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

interface ProductCardProps {
  product: any; 
  womenProduct?: any;
  defaultGender?: "men" | "women";
}

export default function ProductCard({ product, womenProduct, defaultGender = "men" }: ProductCardProps) {
  const [selectedGender, setSelectedGender] = useState<"men" | "women">(defaultGender);

  // Sync selectedGender with defaultGender prop changes
  useEffect(() => {
    setSelectedGender(defaultGender);
  }, [defaultGender]);

  const currentProduct = selectedGender === "women" && womenProduct ? womenProduct : product;

  // Safe extraction of images
  const images = currentProduct.images && currentProduct.images.length > 0 
    ? currentProduct.images 
    : [{ url: "https://via.placeholder.com/400x500", altText: currentProduct.title }];

  const imageUrl = images[0]?.url;

  // Always grab the first variant to use for the Quick Add
  const firstVariant = currentProduct.variants?.[0];
  const price = firstVariant?.price || 0;

  const { addItem, toggleCart } = useCartStore();
  const { data: session } = useSession();
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isProductWishlisted = isWishlisted(currentProduct.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(currentProduct, session);
  };

  // Carousel States & Handlers
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentIndex(index);
    }
  };

  const scrollToIndex = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrollRef.current && index >= 0 && index < images.length) {
      const clientWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: index * clientWidth,
        behavior: "smooth"
      });
      setCurrentIndex(index);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (firstVariant?.id) {
        addItem(firstVariant.id, {
        variantTitle: firstVariant.title,
        price: firstVariant.price,
        productTitle: currentProduct.title,
        image: imageUrl
      });
      toggleCart();
    } else {
      console.error("No variant found for this product");
    }
  };

  return (
    <Link href={`/products/${currentProduct.handle}`} className="group cursor-pointer block">
      <div className="relative w-full aspect-[3/4] bg-white mb-4 overflow-hidden rounded-2xl border border-neutral-100/50 group/card">
        {/* Wishlist Button (Ribbon Overlay) */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3.5 right-3.5 p-2 bg-white/70 backdrop-blur-md rounded-full shadow-sm hover:scale-105 hover:bg-white transition-all z-20 flex items-center justify-center text-black"
          aria-label={isProductWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <svg
            className="w-4 h-4 transition-all duration-300"
            fill={isProductWishlisted ? "black" : "none"}
            stroke="black"
            strokeWidth={1.75}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Style to hide scrollbar on Webkit browsers */}
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
        `}} />

        {/* Horizontal Snap Scroll Container */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img: any, idx: number) => {
            const isZoomed = img.url.includes("do-not-be-afraid");
            return (
              <div key={img.id || idx} className="w-full h-full flex-shrink-0 snap-start snap-always relative overflow-hidden rounded-2xl">
                <img
                  src={getOptimizedCloudinaryUrl(img.url, { width: 600 })}
                  alt={img.altText || `${currentProduct.title} view ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                  className={`w-full h-full object-cover object-top rounded-2xl animate-fade-in transition-all duration-300 ${
                    isZoomed ? "scale-[1.12] origin-top" : ""
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Hover Navigation Arrows (Desktop Only) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => scrollToIndex(currentIndex - 1, e)}
              disabled={currentIndex === 0}
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity z-10 flex items-center justify-center ${
                currentIndex === 0 ? "pointer-events-none opacity-0" : ""
              }`}
              aria-label="Previous image"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => scrollToIndex(currentIndex + 1, e)}
              disabled={currentIndex === images.length - 1}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-1.5 rounded-full shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity z-10 flex items-center justify-center ${
                currentIndex === images.length - 1 ? "pointer-events-none opacity-0" : ""
              }`}
              aria-label="Next image"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Tracking Indicator Dots (Bottom Centered) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/15 backdrop-blur-[2px] px-2.5 py-1 rounded-full">
            {images.map((_: any, idx: number) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "bg-white scale-110" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Gender Toggle for Plain Tees */}
      {womenProduct && (
        <div className="flex gap-2 mb-2.5 px-0.5 text-[9px] font-black uppercase tracking-widest">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedGender("men");
            }}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedGender === "men"
                ? "bg-black text-white border-black"
                : "bg-white text-neutral-400 border-neutral-200 hover:text-black hover:border-neutral-300"
            }`}
          >
            Men
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedGender("women");
            }}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedGender === "women"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-neutral-200 hover:text-neutral-400 hover:border-neutral-300"
            }`}
          >
            Women
          </button>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-1 sm:pr-2">
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight text-black">
            {currentProduct.title}
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