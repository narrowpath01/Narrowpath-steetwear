"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, ExternalLinkIcon } from "./Icons";

interface AdminTopNavProps {
  onOpenMobile: () => void;
  user: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
  };
}

export function AdminTopNav({ onOpenMobile, user }: AdminTopNavProps) {
  const pathname = usePathname();

  // Generate breadcrumb / title from path
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const title = segments.length === 0
    ? "Dashboard"
    : segments[0].charAt(0).toUpperCase() + segments[0].slice(1);

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-neutral-600 hover:text-black p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 focus:outline-none transition"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium">Narrow Path Ops</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900 font-bold">{title}</span>
          {segments.length > 1 && (
            <>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-600 capitalize font-medium">{segments[1]}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-200 bg-neutral-50 text-neutral-700 hover:text-black hover:bg-neutral-100 hover:border-neutral-300 transition shadow-sm"
        >
          <span>Live Store</span>
          <ExternalLinkIcon className="w-3.5 h-3.5 text-neutral-400" />
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-neutral-200">
          <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[11px] font-bold uppercase shadow-sm">
            {user.name ? user.name.slice(0, 2) : "AD"}
          </div>
          <span className="hidden md:inline-block text-xs font-semibold text-neutral-800">
            {user.name || "Admin"}
          </span>
          <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
