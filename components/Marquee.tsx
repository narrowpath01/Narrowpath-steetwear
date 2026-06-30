// components/Marquee.tsx
"use client";

import { motion } from "framer-motion";

interface MarqueeProps {
  text: string;
  speed?: "slow" | "medium" | "fast";
  className?: string;
}

export default function Marquee({ text, speed = "medium", className = "" }: MarqueeProps) {
  // Repeat the text multiple times with wide spacing and no dots
  const repeatedText = Array(15).fill(text).join("                ");

  // Determine duration based on speed (slow = 200s for extremely slow speed)
  const duration = speed === "slow" ? 200 : speed === "fast" ? 25 : 60;

  return (
    <div className={`flex overflow-hidden bg-black text-white py-3 border-y border-neutral-800 ${className}`}>
      <motion.div
        className="flex whitespace-nowrap text-xs sm:text-sm font-bold tracking-[0.2em] uppercase"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: duration }}
      >
        <span className="mr-8">{repeatedText}</span>
        <span className="mr-8">{repeatedText}</span>
      </motion.div>
    </div>
  );
}