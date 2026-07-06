// components/EditorialCarousel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Marquee from "./Marquee";

interface EditorialCarouselProps {
  products?: any[];
}

const COLLECTIONS_FALLBACK = [
  { id: "fallback-1", title: "WINTER COLLECTION", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop", handle: "" },
  { id: "fallback-2", title: "CAPS", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop", handle: "" },
  { id: "fallback-3", title: "HOODIES", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop", handle: "" },
  { id: "fallback-4", title: "TEES", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop", handle: "" },
];

export default function EditorialCarousel({ products = [] }: EditorialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isWheeling = useRef(false);

  // Map products to matching title, image and link references
  const items = products && products.length > 0
    ? products.slice(0, 4).map((p) => ({
        id: p.id,
        title: p.title.toUpperCase(),
        image: p.images?.[0]?.url || "https://via.placeholder.com/400x500",
        handle: p.handle
      }))
    : COLLECTIONS_FALLBACK;

  // Position sunflower tee as 1st image (index 0)
  const sunflowerIdx = items.findIndex(item => item.handle.includes("sunflower"));
  if (sunflowerIdx !== -1 && sunflowerIdx !== 0) {
    const temp = items[0];
    items[0] = items[sunflowerIdx];
    items[sunflowerIdx] = temp;
  }

  // Position kung fu panda tee as 3rd image (index 2)
  const pandaIdx = items.findIndex(item => item.handle.includes("panda"));
  if (pandaIdx !== -1 && pandaIdx !== 2 && items.length > 2) {
    const temp = items[2];
    items[2] = items[pandaIdx];
    items[pandaIdx] = temp;
  }

  // The Engineering Fix: Double the array to create invisible buffer items
  const extendedItems = [
    ...items,
    ...items.map((item, idx) => ({ ...item, id: `${item.id}-buffer-${idx}` }))
  ];

  const len = extendedItems.length; 

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setActiveIndex((prev) => (prev + 1) % len);
    } else if (info.offset.x > swipeThreshold) {
      setActiveIndex((prev) => (prev - 1 + len) % len);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault(); 
        if (isWheeling.current) return;

        const wheelSensitivity = 25;
        if (e.deltaX > wheelSensitivity) {
          setActiveIndex((prev) => (prev + 1) % len);
          triggerCooldown();
        } else if (e.deltaX < -wheelSensitivity) {
          setActiveIndex((prev) => (prev - 1 + len) % len);
          triggerCooldown();
        }
      }
    };

    const triggerCooldown = () => {
      isWheeling.current = true;
      setTimeout(() => { isWheeling.current = false; }, 600); 
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [len]);

  const getVariant = (index: number) => {
    if (index === activeIndex) return "active";
    if (index === (activeIndex - 1 + len) % len) return "left";
    if (index === (activeIndex + 1) % len) return "right";
    
    const diff = (index - activeIndex + len) % len;
    if (diff > len / 2) return "hiddenLeft";
    return "hiddenRight";
  };

  const cardVariants = {
    active: { x: "0%", scale: 1, zIndex: 20, opacity: 1 },
    left: { x: "-65%", scale: 0.85, zIndex: 10, opacity: 0.9 },
    right: { x: "65%", scale: 0.85, zIndex: 10, opacity: 0.9 },
    hiddenLeft: { x: "-120%", scale: 0.7, zIndex: 0, opacity: 0 },
    hiddenRight: { x: "120%", scale: 0.7, zIndex: 0, opacity: 0 },
  };

  const handleDotClick = (idx: number) => {
    // Math to ensure the carousel takes the shortest path when clicking a dot
    const currentBase = activeIndex - (activeIndex % items.length);
    setActiveIndex(currentBase + idx);
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full bg-zinc-50 pt-3 pb-6 md:pt-4 md:pb-12 overflow-hidden flex flex-col items-center border-t border-neutral-100"
    >
      {/* Mobile-only Marquee: below the navbar, above the slides */}
      <div className="w-full px-4 mb-8 block md:hidden text-center">
        <Marquee 
          text="Customization Available" 
          speed="slow" 
          className="rounded-[32px] overflow-hidden border border-neutral-800" 
        />
        <div className="flex justify-center mt-3">
          <Link
            href="/customise"
            className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] sm:text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-sm hover:scale-105 hover:bg-yellow-100/50 hover:border-yellow-300 transition-all duration-300 active:scale-95"
          >
            🔥Buy 2 Tees, Take INR 100 Back!🔥
          </Link>
        </div>
      </div>

      <div className="relative w-full max-w-[400px] h-[500px] flex justify-center items-center">
        <AnimatePresence initial={false}>
          {extendedItems.map((item, index) => {
            const variant = getVariant(index);

            const cardContent = (
              <motion.div
                variants={cardVariants}
                initial={false}
                animate={variant}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover pointer-events-none object-top rounded-2xl"
                  sizes="(max-width: 768px) 80vw, 400px"
                  priority={index === 0 || index === 1}
                />
              </motion.div>
            );

            // Wrap in absolute positioning div matching relative parent dimensions
            return (
              <div 
                key={item.id} 
                className="absolute w-[80%] md:w-[90%] h-full flex justify-center items-center"
                style={{ pointerEvents: variant === "active" ? "auto" : "none" }}
              >
                {item.handle ? (
                  <Link href={`/products/${item.handle}`} className="w-full h-full block relative">
                    {cardContent}
                  </Link>
                ) : (
                  <div className="w-full h-full block relative">
                    {cardContent}
                  </div>
                )}
              </div>
            );
          })}
        </AnimatePresence>

      </div>

      <div className="flex justify-center gap-3 mt-4">
        {items.map((_, idx) => {
          // Use modulo to highlight the correct dot out of the original 4
          const isActive = activeIndex % items.length === idx;
          return (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                isActive ? "w-8 bg-black" : "w-2 bg-neutral-300 hover:bg-neutral-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Desktop-only Marquee: below the slides/dots */}
      <div className="w-full px-12 mt-10 hidden md:block text-center">
        <Marquee 
          text="Customization Available" 
          speed="slow" 
          className="rounded-[32px] overflow-hidden border border-neutral-800" 
        />
        <div className="flex justify-center mt-3">
          <Link
            href="/customise"
            className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] sm:text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-sm hover:scale-105 hover:bg-yellow-100/50 hover:border-yellow-300 transition-all duration-300 active:scale-95"
          >
            🔥Buy 2 Tees, Take INR 100 Back!🔥
          </Link>
        </div>
      </div>
    </section>
  );
}