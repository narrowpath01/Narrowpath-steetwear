"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/porsche-model.png",
    alt: "Porsche 911 Heavyweight Tee Model View",
  },
  {
    image: "/space-ship-model.png",
    alt: "Space Ship Heavyweight Tee Model View",
  },
  {
    image: "/red-moon-model.png",
    alt: "Red Moon Heavyweight Tee Model View",
  },
  {
    image: "/warrior-model.png",
    alt: "Warrior Heavyweight Tee Model View",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500); // Transition every 4.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] bg-neutral-950 overflow-hidden select-none">
      {/* 1. SLIDING BACKGROUND IMAGES */}
      <div className="absolute inset-0 z-0 overflow-hidden w-full h-full">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex"
          >
            {/* Left Image (always shown on mobile, left half on desktop) */}
            <div className="w-full md:w-1/2 h-full relative overflow-hidden">
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].alt}
                className="w-full h-full object-cover object-top scale-[1.03]"
              />
            </div>
            {/* Right Image (only shown on desktop/md and up) */}
            <div className="hidden md:block w-1/2 h-full relative overflow-hidden border-l border-neutral-900">
              <img
                src={slides[(currentSlide + 1) % slides.length].image}
                alt={slides[(currentSlide + 1) % slides.length].alt}
                className="w-full h-full object-cover object-top scale-[1.03]"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. FIXED STATIONARY CTA OVERLAY (Does not slide) */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 md:pb-24 text-center px-6">
        <Link 
          href="/shop" 
          className="inline-block bg-white text-black px-10 py-4.5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-neutral-100 transition-all shadow-xl active:scale-[0.98] duration-200"
        >
          SHOP NOW
        </Link>
      </div>

      {/* 3. SLIDESHOW CONTROLLER DOTS (Stationary) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
              currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
