// components/Marquee.tsx
"use client";

import { motion } from "framer-motion";

interface MarqueeProps {
  text: string;
  speed?: "slow" | "medium" | "fast";
  className?: string;
}

export default function Marquee({ text, speed = "medium", className = "" }: MarqueeProps) {
  // Repeat the text multiple times with wide spacing using non-breaking spaces to prevent HTML collapsing
  const spaceSeparator = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
  const repeatedText = Array(15).fill(text).join(spaceSeparator);

  // Determine duration based on speed (slow = 200s for extremely slow speed)
  const duration = speed === "slow" ? 200 : speed === "fast" ? 25 : 60;

  return (
    <div className={`flex overflow-hidden bg-black text-white py-3 border-y border-neutral-800 ${className}`}>
      <motion.div
        className="flex whitespace-nowrap text-xs sm:text-sm font-bold tracking-[0.2em] uppercase will-change-transform"
        style={{ transform: "translateZ(0)" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: duration }}
      >
        <span>{repeatedText}{spaceSeparator}</span>
        <span>{repeatedText}{spaceSeparator}</span>
      </motion.div>
    </div>
  );
}