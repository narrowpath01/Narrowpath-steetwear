// components/Marquee.tsx
"use client";

import { motion } from "framer-motion";

export default function Marquee({ text }: { text: string }) {
  // Repeat the text multiple times so the screen is always filled
  const repeatedText = Array(10).fill(text).join(" • ");

  return (
    <div className="flex overflow-hidden bg-black text-white py-3 border-y border-neutral-800">
      <motion.div
        className="flex whitespace-nowrap text-xs sm:text-sm font-bold tracking-[0.2em] uppercase"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
      >
        <span className="mr-8">{repeatedText}</span>
        <span className="mr-8">{repeatedText}</span>
      </motion.div>
    </div>
  );
}