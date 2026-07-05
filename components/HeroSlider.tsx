"use client";

import { useState, useEffect } from "react";

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
      <div 
        className="absolute inset-0 flex transition-transform duration-1000 ease-out"
        style={{ 
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(currentSlide * 100) / slides.length}%)` 
        }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className="h-full relative overflow-hidden"
            style={{ width: `${100 / slides.length}%` }}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-center scale-[1.03] animate-fade-in"
            />
          </div>
        ))}
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
