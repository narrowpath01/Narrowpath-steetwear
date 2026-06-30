// components/Hero.tsx
"use client"; 

import Image from "next/image";

export default function Hero() {
  return (
    <section id="hero-section" className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-50 rounded-b-[2rem]">
      
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://img.magnific.com/free-photo/t-shirt-with-pants-shoes-wooden-background_1203-8009.jpg"
          alt="Hero Background" 
          fill 
          className="object-cover" 
          priority
        />
      </div>
      
    </section>
  );
}