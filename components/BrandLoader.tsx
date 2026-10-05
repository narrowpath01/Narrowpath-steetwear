"use client";

import React from "react";
import Image from "next/image";

export default function BrandLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading..."
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-200 pointer-events-auto select-none"
    >
      {/* Prominent Floating Brand Logo without white box */}
      <div className="relative w-32 sm:w-36 md:w-40 flex items-center justify-center select-none animate-in fade-in zoom-in-95 duration-150">
        <Image
          src="/logo.png"
          alt="Loading..."
          width={197}
          height={98}
          className="w-full h-auto object-contain animate-pulse drop-shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
          priority
        />
      </div>
    </div>
  );
}
