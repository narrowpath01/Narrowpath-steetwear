// components/EditorialCarousel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";

const COLLECTIONS = [
  { id: 1, title: "WINTER COLLECTION", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop" },
  { id: 2, title: "CAPS", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop" },
  { id: 3, title: "HOODIES", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop" },
  { id: 4, title: "TEES", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop" },
];

// The Engineering Fix: Double the array to create invisible buffer items
const EXTENDED_COLLECTIONS = [
  ...COLLECTIONS,
  ...COLLECTIONS.map((item) => ({ ...item, id: item.id + 4 }))
];

export default function EditorialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isWheeling = useRef(false);
  
  // Use the extended 8-item length for the math engine
  const len = EXTENDED_COLLECTIONS.length; 

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
    const currentBase = activeIndex - (activeIndex % COLLECTIONS.length);
    setActiveIndex(currentBase + idx);
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full bg-zinc-100 py-16 md:py-24 overflow-hidden flex flex-col items-center"
    >
      <div className="relative w-full max-w-[400px] h-[500px] flex justify-center items-center">
        <AnimatePresence initial={false}>
          {EXTENDED_COLLECTIONS.map((item, index) => {
            const variant = getVariant(index);

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial={false}
                animate={variant}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="absolute w-[80%] md:w-[90%] h-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="(max-width: 768px) 80vw, 400px"
                  priority={index === 0 || index === 1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
                  <h3 className="text-white text-2xl font-black uppercase tracking-widest drop-shadow-md">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-3 mt-8">
        {COLLECTIONS.map((_, idx) => {
          // Use modulo to highlight the correct dot out of the original 4
          const isActive = activeIndex % COLLECTIONS.length === idx;
          return (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isActive ? "w-8 bg-black" : "w-2 bg-neutral-300"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}