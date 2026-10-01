"use client";

import { useState, useRef, useEffect } from "react";
import ProductGallery from "./ProductGallery";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSession } from "next-auth/react";

interface ProductGalleryWrapperProps {
  images: any[];
  product?: any;
}

export default function ProductGalleryWrapper({ images, product }: ProductGalleryWrapperProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const { data: session } = useSession();
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isProductWishlisted = product ? isWishlisted(product.id) : false;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) {
      toggleWishlist(product, session);
    }
  };

  const handleScroll = () => {
    if (rafId.current !== null) return;
    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;
      if (!containerRef.current) return;
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      
      // The ProductGallery component renders a div containing the list of image wrappers
      const galleryContainer = container.firstElementChild;
      if (!galleryContainer) return;
      
      const children = galleryContainer.children;
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const distance = Math.abs(child.offsetTop - scrollTop);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      setActiveImageIndex(closestIndex);
    });
  };

  const scrollToImage = (idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const galleryContainer = container.firstElementChild;
    if (!galleryContainer) return;
    const targetChild = galleryContainer.children[idx] as HTMLElement;
    if (targetChild) {
      container.scrollTo({
        top: targetChild.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full flex gap-3 sm:gap-6 items-stretch lg:h-full relative">
      {/* Left Vertical Dots Indicator */}
      {images.length > 1 && (
        <div className="flex flex-col justify-center gap-3 px-3 select-none flex-shrink-0">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              className={`w-1.5 rounded-full cursor-pointer transition-all duration-500 ${
                activeImageIndex === idx ? "h-8 bg-black" : "h-1.5 bg-neutral-300 hover:bg-neutral-400"
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scrolling Image Stack Container (relative positioned so offsetTop matches container scroll) */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 rounded-2xl overflow-y-auto h-[60vh] lg:h-full scrollbar-hide"
      >
        <ProductGallery images={images} />
      </div>

      {/* Wishlist Button (Ribbon Overlay) */}
      {product && (
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 p-2.5 bg-white/70 backdrop-blur-md rounded-full shadow-sm hover:scale-105 hover:bg-white transition-all z-20 flex items-center justify-center text-black"
          aria-label={isProductWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <svg
            className="w-5 h-5 transition-all duration-300"
            fill={isProductWishlisted ? "black" : "none"}
            stroke="black"
            strokeWidth={1.75}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
