"use client";

import { useState, useRef } from "react";
import ProductGallery from "./ProductGallery";

interface ProductGalleryWrapperProps {
  images: any[];
}

export default function ProductGalleryWrapper({ images }: ProductGalleryWrapperProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // The ProductGallery component renders a div containing the list of image wrappers
    const galleryContainer = container.firstElementChild;
    if (!galleryContainer) return;
    
    const children = galleryContainer.children;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const distance = Math.abs(rect.top - containerRect.top);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    setActiveImageIndex(closestIndex);
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
    <div className="w-full flex gap-3 sm:gap-6 items-stretch lg:h-full">
      {/* Left Vertical Dots Indicator */}
      {images.length > 1 && (
        <div className="flex flex-col justify-center gap-3 pr-1 sm:pr-2 select-none flex-shrink-0">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                activeImageIndex === idx ? "bg-black scale-125" : "bg-neutral-300 hover:bg-neutral-400"
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
        className="relative flex-1 rounded-2xl overflow-y-auto h-[60vh] lg:h-full scrollbar-hide overscroll-contain"
      >
        <ProductGallery images={images} />
      </div>
    </div>
  );
}
