import React from "react";

export function InfoMarquee() {
  const items = [
    {
      icon: (
        <svg className="w-5 h-5 text-black shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8.5v-2L8 4h8l4 2.5v2L17 10v10H7V10L4 8.5z" />
          <path d="M9 4c0 1.66 1.34 3 3 3s3-1.34 3-3" />
        </svg>
      ),
      text: "OVERSIZED STREETWEAR FIT",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-black shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="7" r="3" />
          <circle cx="8.5" cy="11.5" r="3" />
          <circle cx="15.5" cy="11.5" r="3" />
          <circle cx="12" cy="16" r="3" />
          <path d="M12 19v3M9.5 21c1.5-1 3.5-1 5 0" />
        </svg>
      ),
      text: "240 GSM FRENCH TERRY COTTON",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-black shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17c2-1 4-1 6 0s4 1 6 0" />
          <path d="M4 20c2-1 4-1 6 0s4 1 6 0" />
          <path d="M7 13V4M7 4l-1.5 1.5M7 4l1.5 1.5" />
          <path d="M12 13V4M12 4l-1.5 1.5M12 4l1.5 1.5" />
          <path d="M17 13V4M17 4l-1.5 1.5M17 4l1.5 1.5" />
        </svg>
      ),
      text: "SUPER SOFT & BREATHABLE",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-black shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="6" />
          <path d="M9 14.5L7 22l5-3 5 3-2-7.5" />
          <path d="M12 6l1 2.5h2.5l-2 1.5.5 2.5-2-1.5-2 1.5.5-2.5-2-1.5H9.5z" />
        </svg>
      ),
      text: "PREMIUM QUALITY",
    },
  ];

  // Duplicate items to ensure scrolling content loops infinitely
  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full px-4 md:px-8 py-3 bg-neutral-50">
      <div className="relative max-w-[1600px] mx-auto border border-neutral-300 rounded-3xl bg-white overflow-hidden py-4.5 shadow-sm">
        {/* Fading left/right edge masks to mask items as they slide under the rounded corners */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/85 to-transparent pointer-events-none z-10" />

        {/* Horizontal Marquee Container */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex items-center gap-20">
            {marqueeItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0">
                {item.icon}
                <span className="text-[11px] font-semibold uppercase tracking-widest text-black">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
