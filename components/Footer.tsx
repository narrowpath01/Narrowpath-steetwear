// components/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-28 md:pb-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

        {/* Column 1: Connect */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Connect</h3>
          <a 
            href="https://www.instagram.com/narrowpath.in/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-sm font-medium hover:text-neutral-400 transition-colors"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            Instagram
          </a>
          <a 
            href="https://wa.me/919315457852" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-sm font-medium hover:text-neutral-400 transition-colors"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.004 2c-5.518 0-9.996 4.477-9.996 9.996 0 1.764.459 3.486 1.332 5.006L2 22l5.185-1.36c1.474.804 3.129 1.226 4.819 1.226 5.517 0 9.996-4.477 9.996-9.996C22.004 6.477 17.521 2 12.004 2zm0 1.662c4.6 0 8.334 3.733 8.334 8.334 0 4.6-3.734 8.334-8.334 8.334-1.536 0-3.037-.424-4.343-1.227l-.311-.19-3.07.805.82-2.996-.208-.332a8.307 8.307 0 0 1-1.226-4.394c0-4.6 3.734-8.334 8.334-8.334zm-3.6 3.197c-.196 0-.422.072-.619.29-.196.218-.75.733-.75 1.787 0 1.054.767 2.074.872 2.217.106.144 1.477 2.378 3.633 3.29.513.217.914.347 1.227.447.515.163.985.14 1.354.085.412-.061 1.267-.518 1.444-1.02.178-.501.178-.931.124-1.02-.053-.089-.196-.144-.412-.253-.217-.11-1.267-.626-1.463-.698-.196-.072-.34-.11-.486.11-.144.218-.567.727-.698.872-.131.144-.262.163-.478.054-.218-.11-.92-.34-1.754-1.085-.648-.578-1.085-1.293-1.212-1.512-.128-.218-.014-.336.094-.444.1-.097.218-.254.327-.382.11-.127.145-.218.218-.363.072-.145.036-.272-.018-.381-.054-.11-.486-1.173-.668-1.61-.178-.426-.35-.367-.48-.374-.124-.007-.267-.007-.412-.007z"/>
            </svg>
            WhatsApp
          </a>
        </div>

        {/* Column 2: Support */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Support</h3>
          <Link href="/policies/exchange" className="text-sm font-medium hover:text-neutral-400 transition-colors">Exchange Policy</Link>
          <Link href="/policies/refund" className="text-sm font-medium hover:text-neutral-400 transition-colors">Refund Policy</Link>
          <Link href="/policies/shipping" className="text-sm font-medium hover:text-neutral-400 transition-colors">Shipping Policy</Link>
          <Link href="/policies/terms" className="text-sm font-medium hover:text-neutral-400 transition-colors">Terms of Service</Link>
          <Link href="/policies/privacy" className="text-sm font-medium hover:text-neutral-400 transition-colors">Privacy Policy</Link>
        </div>

        {/* Column 3: About */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Narrow Path</h3>
          <Link href="/about" className="text-sm font-medium hover:text-neutral-400 transition-colors">Our Story</Link>
        </div>

        {/* Column 4 & 5: Giant Brand Anchor */}
        <div className="lg:col-span-2 flex items-center justify-start lg:justify-end">
          {/* Replacing the shopping bag image with massive brand text to fit your aesthetic */}
          <span className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
            NARROW<br/>PATH
          </span>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center pt-8 border-t border-neutral-800 text-xs text-neutral-500 font-medium tracking-wide">
        <p>&copy; {new Date().getFullYear()} NARROW PATH RETAIL. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="/policies/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/policies/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}