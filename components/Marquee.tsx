// components/Marquee.tsx
"use client";

import React from "react";

interface MarqueeProps {
  text?: string;
  speed?: "slow" | "medium" | "fast";
  className?: string;
}

export default function Marquee({ text, className = "" }: MarqueeProps) {
  // Parse phrases or use streetwear promotion defaults
  const phrases = text
    ? text
        .split(/\u00A0{2,}|\s{4,}|\s*•\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    : ["CUSTOMIZATION AVAILABLE", "BUY 2 TEES, TAKE INR 100 BACK!"];

  const cleanPhrases =
    phrases.length > 0
      ? phrases
      : ["CUSTOMIZATION AVAILABLE", "BUY 2 TEES, TAKE INR 100 BACK!"];

  // Double items for seamless 0% -> -50% infinite CSS marquee animation
  const repeatCount = Math.max(4, Math.ceil(8 / cleanPhrases.length));
  const halfItems: string[] = [];
  for (let i = 0; i < repeatCount; i++) {
    halfItems.push(...cleanPhrases);
  }
  const marqueeItems = [...halfItems, ...halfItems];

  return (
    <div
      className={`relative w-full max-w-[1600px] mx-auto border border-yellow-300/90 rounded-3xl bg-[#FEF9C3] overflow-hidden py-3.5 sm:py-4 shadow-sm ${className}`}
    >
      {/* Fading left/right edge masks matching the soft yellowish background */}
      <div className="absolute inset-y-0 left-0 w-20 sm:w-28 bg-gradient-to-r from-[#FEF9C3] via-[#FEF9C3]/85 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 sm:w-28 bg-gradient-to-l from-[#FEF9C3] via-[#FEF9C3]/85 to-transparent pointer-events-none z-10" />

      {/* Horizontal Marquee Container */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 sm:gap-14">
          {marqueeItems.map((phrase, idx) => (
            <div key={idx} className="flex items-center gap-10 sm:gap-14 shrink-0">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-900">
                {phrase}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900/80 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}