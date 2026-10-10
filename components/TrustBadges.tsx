import React from "react";

export function TrustBadges() {
  const badges = [
    {
      icon: (
        <svg aria-hidden="true" className="w-8 h-8 text-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: "Fast Delivery",
      desc: "Fast shipping, hassle-free – shop with confidence!",
    },
    {
      icon: (
        <svg aria-hidden="true" className="w-8 h-8 text-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="2" />
          <path d="M12 13v3" />
        </svg>
      ),
      title: "Safe Payment",
      desc: "Your payments, protected with the highest security.",
    },
    {
      icon: (
        <svg aria-hidden="true" className="w-8 h-8 text-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="9" r="3" />
          <path d="M12 7.5v2l1 1" />
        </svg>
      ),
      title: "Online Support",
      desc: "We're available from 10 AM to 8 PM—ask us anything and get instant help",
    },
    {
      icon: (
        <svg aria-hidden="true" className="w-8 h-8 text-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      ),
      title: "Easy Returns",
      desc: "5-day easy exchange & return on standard Plain & Printed tees (customized items excluded).",
    },
  ];

  return (
    <div className="w-full px-4 md:px-8 pb-12 bg-neutral-50">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge, idx) => (
          <div 
            key={idx} 
            className="group flex flex-col items-center text-center p-6 bg-white border border-neutral-300 rounded-3xl shadow-sm hover:shadow-md hover:border-black transition-all duration-300"
          >
            <div className="mb-4 text-black p-3 bg-neutral-50 rounded-2xl group-hover:bg-neutral-100 transition-colors">
              {badge.icon}
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider mb-2 text-black">
              {badge.title}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-[240px]">
              {badge.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
