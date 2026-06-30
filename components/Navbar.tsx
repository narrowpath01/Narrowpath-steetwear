"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
      <header
        className={`fixed top-0 w-full z-[120] transition-all duration-300 ${
          isScrolled || !isHome || isSearchOpen
            ? "bg-white text-black drop-shadow-md"
            : "bg-transparent text-black"
        }`}
      >
        <div className="flex justify-between items-center px-6 md:px-12 py-3 w-full h-[72px]">

          {/* LEFT: Hamburger Menu */}
          <div className="flex-1">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 hover:opacity-70 transition-opacity">
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
          {/* FIX APPLIED HERE: Changed gap-4 to gap-2 md:gap-4 lg:gap-6 to squeeze mobile icons */}
          <div className="flex-1 flex justify-end items-center gap-2 md:gap-4 lg:gap-6 pr-2">

            {/* Search */}
            <button onClick={() => setIsSearchOpen(true)}
              className="hover:opacity-50 transition-opacity" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Login / Profile Cluster */}
            {session ? (
              <Link href="/profile" className="hover:opacity-50 transition-opacity" aria-label="View Profile">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            ) : (
              <Link href="/login" className="hover:opacity-50 transition-opacity" aria-label="Login">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Wishlist / Bookmark */}
            <Link href="/wishlist" className="hover:opacity-50 transition-opacity" aria-label="Wishlist">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Link>

            {/* Cart Bag */}
            <button onClick={toggleCart} className="relative flex items-center hover:opacity-50 transition-opacity" aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-transparent">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* INVERTED CORNERS (The Scoop Effect) */}
        <div className="absolute top-full left-0 right-0 pointer-events-none">
          {/* Left Scoop */}
          <svg 
            className={`absolute top-0 left-0 w-8 h-8 fill-current transition-colors duration-300 ${
              isScrolled || !isHome || isSearchOpen ? "text-white" : "text-transparent"
            }`} 
            viewBox="0 0 32 32"
          >
            <path d="M0 0h32A32 32 0 000 32V0z" />
          </svg>
          {/* Right Scoop */}
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

      {/* LEFT MENU DRAWER (Hamburger Navigation) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] flex">
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
              <Link href="/collections" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase text-black hover:opacity-50">Collections</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase text-black hover:opacity-50">About</Link>
            </nav>
          </div>

          <div
            className="flex-1 bg-black/60 cursor-pointer backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      )}

      {/* TOP DROP-DOWN SEARCH PANEL */}
      {isSearchOpen && (
        <>
          {/* Dark Backdrop - Starts below navbar */}
          <div
            className="fixed inset-x-0 bottom-0 top-[72px] bg-black/40 z-[140] backdrop-blur-sm transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Search Panel Container - Starts below navbar */}
          <div className="fixed top-[72px] left-0 w-full bg-white z-[150] px-6 py-6 md:px-12 md:py-8 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto">

              {/* Search Bar Row */}
              <div className="flex items-center gap-4 mb-8">
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