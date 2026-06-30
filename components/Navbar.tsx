"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const { data: session } = useSession();

  const { cartCount, toggleCart } = useCartStore();

  // Search Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Sets to true the moment you scroll down more than 0 pixels
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 1. DESKTOP HEADER (Hidden on mobile) */}
      <header
        className={`fixed top-0 w-full z-[120] transition-all duration-300 hidden md:block ${
          isScrolled || !isHome || isSearchOpen
            ? "bg-white text-black drop-shadow-md"
            : "bg-transparent text-black"
        }`}
      >
        <div className="flex justify-between items-center px-6 md:px-12 py-3 w-full h-[72px]">
          {/* LEFT: Hamburger Menu */}
          <div className="flex-1">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 hover:opacity-70 transition-opacity text-black">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* CENTER: THE LOGO */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="text-lg md:text-xl font-black uppercase tracking-tighter whitespace-nowrap text-black hover:opacity-70 transition-opacity">
              NARROW PATH
            </Link>
          </div>

          {/* RIGHT: Icon Cluster */}
          <div className="flex-1 flex justify-end items-center gap-2 md:gap-4 lg:gap-6 pr-2">
            {/* Search */}
            <button onClick={() => setIsSearchOpen(true)}
              className="hover:opacity-50 transition-opacity text-black" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Login / Profile */}
            {session ? (
              <Link href="/profile" className="hover:opacity-50 transition-opacity text-black" aria-label="View Profile">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            ) : (
              <Link href="/login" className="hover:opacity-50 transition-opacity text-black" aria-label="Login">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" className="hover:opacity-50 transition-opacity text-black" aria-label="Wishlist">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Link>

            {/* Cart Bag */}
            <button onClick={toggleCart} className="relative flex items-center hover:opacity-50 transition-opacity text-black" aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* INVERTED CORNERS (The Scoop Effect) */}
        <div className="absolute top-full left-0 right-0 pointer-events-none">
          <svg 
            className={`absolute top-0 left-0 w-8 h-8 fill-current transition-colors duration-300 ${
              isScrolled || !isHome || isSearchOpen ? "text-white" : "text-transparent"
            }`} 
            viewBox="0 0 32 32"
          >
            <path d="M0 0h32A32 32 0 000 32V0z" />
          </svg>
          <svg 
            className={`absolute top-0 right-0 w-8 h-8 fill-current transition-colors duration-300 ${
              isScrolled || !isHome || isSearchOpen ? "text-white" : "text-transparent"
            }`} 
            viewBox="0 0 32 32"
          >
            <path d="M32 0H0a32 32 0 0132 32V0z" />
          </svg>
        </div>
      </header>

      {/* 2. DESKTOP MENU DRAWER (Hidden on mobile) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] hidden md:flex">
          <div className="w-80 bg-white h-full shadow-2xl p-6 flex flex-col gap-8 transform transition-transform">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="self-end p-2 hover:bg-neutral-100 rounded-full transition-colors text-black flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col gap-6 mt-10">
              <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase text-black hover:opacity-50">Shop</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase text-black hover:opacity-50">About</Link>
            </nav>
          </div>
          <div
            className="flex-1 bg-black/60 cursor-pointer backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      )}

      {/* 3. MOBILE FLOATING CONTROLS (Only visible on mobile) */}
      <div className="md:hidden">
        {/* Top Left Capsule (Pill) */}
        <div className="fixed top-4 left-4 z-[130] flex items-center pointer-events-auto">
          <div className="bg-white/85 backdrop-blur-md border border-neutral-200/80 rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-2.5 shadow-sm">
            {/* Plus / Cross circular toggle button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-7 h-7 rounded-full bg-neutral-100/90 hover:bg-neutral-200/90 text-black font-black text-lg flex items-center justify-center transition-all duration-300 shadow-sm focus:outline-none"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isMenuOpen ? "rotate-45" : ""}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2.5} 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-xs font-black uppercase tracking-wider text-black">
              NARROW PATH
            </Link>
          </div>
        </div>

        {/* Top Right Floating Icons */}
        <div className="fixed top-4 right-4 z-[130] flex items-center gap-2.5 pointer-events-auto">
          {/* Wishlist Bookmark */}
          <Link 
            href="/wishlist" 
            className="bg-white/85 backdrop-blur-md border border-neutral-200/80 rounded-full p-2.5 shadow-sm text-black flex items-center justify-center hover:bg-white transition-all" 
            aria-label="Wishlist"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </Link>

          {/* Cart Bag */}
          <button 
            onClick={toggleCart} 
            className="relative bg-white/85 backdrop-blur-md border border-neutral-200/80 rounded-full p-2.5 shadow-sm text-black flex items-center justify-center hover:bg-white transition-all" 
            aria-label="Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Bottom Floating Menu Bar Container */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[130] w-full max-w-[280px] flex items-center justify-center pointer-events-none">
          {/* The Glassmorphic Navigation Capsule */}
          <div className="w-full bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-full px-5 py-3.5 shadow-lg flex items-center justify-between pointer-events-auto">
            {/* Explore (Compass) */}
            <Link 
              href="/shop" 
              className={`hover:opacity-60 transition-opacity ${pathname === "/shop" ? "text-black scale-110 font-bold" : "text-neutral-400"}`}
              aria-label="Explore Shop"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </Link>

            {/* Profile */}
            <Link 
              href={session ? "/profile" : "/login"} 
              className={`hover:opacity-60 transition-opacity ${pathname === "/profile" || pathname === "/login" ? "text-black scale-110 font-bold" : "text-neutral-400"}`}
              aria-label="Profile"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Location (Map Pin) -> Links to About page */}
            <Link 
              href="/about" 
              className={`hover:opacity-60 transition-opacity ${pathname === "/about" ? "text-black scale-110 font-bold" : "text-neutral-400"}`}
              aria-label="Store Location"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
              </svg>
            </Link>

            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className={`hover:opacity-60 transition-opacity ${isSearchOpen ? "text-black scale-110 font-bold" : "text-neutral-400"}`}
              aria-label="Search"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER NAVIGATION (Slide in full screen menu) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[125] flex md:hidden bg-white w-full h-full flex-col">
          {/* Scrollable category list */}
          <div className="flex-1 flex flex-col justify-center gap-6 px-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <Link 
              href="/shop" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-4xl font-black uppercase tracking-tight text-black hover:opacity-50 transition-opacity"
            >
              Shop
            </Link>
            <Link 
              href="/collections" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-4xl font-black uppercase tracking-tight text-black hover:opacity-50 transition-opacity"
            >
              Collections
            </Link>
            <Link 
              href="/customise" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-4xl font-black uppercase tracking-tight text-black hover:opacity-50 transition-opacity text-[#005bd3]"
            >
              Customise Your Tee
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-4xl font-black uppercase tracking-tight text-black hover:opacity-50 transition-opacity"
            >
              About
            </Link>
          </div>

          {/* About us & Contact info footer */}
          <div className="px-12 py-6 border-t border-neutral-100 bg-neutral-50/50 text-neutral-500 space-y-2 text-xs">
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="block hover:text-black transition-colors font-bold uppercase tracking-wider text-[10px]">
              About Us
            </Link>
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold block uppercase tracking-wider text-[10px] text-neutral-400 mb-0.5">Contact Us</span>
              Email: <a href="mailto:narrowpathtshirts@gmail.com" className="font-mono hover:underline">narrowpathtshirts@gmail.com</a><br />
              Phone: <span className="font-mono">9315457852</span>
            </div>
          </div>

          {/* Clean Close Drawer Button at bottom center */}
          <div className="w-full flex flex-col items-center justify-center py-4 border-t border-neutral-100 bg-neutral-50/50">
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="text-[10px] uppercase tracking-widest font-black text-neutral-500 hover:text-black transition-colors focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 5. SEARCH PANEL OVERLAY */}
      {isSearchOpen && (
        <>
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[140] backdrop-blur-sm transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Search Panel Container */}
          <div className="fixed top-0 md:top-[72px] left-0 w-full bg-white z-[150] px-6 py-6 md:px-12 md:py-8 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto">
              {/* Search Bar Row */}
              <div className="flex items-center gap-4 mb-4 mt-2 md:mt-0">
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search here...."
                    autoFocus
                    className="w-full bg-gray-100 text-black text-sm rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
                  />
                </form>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black flex-shrink-0"
                  aria-label="Close search"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}