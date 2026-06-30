// components/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-28 md:pb-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

        {/* Column 1: Connect */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Connect</h3>
          <Link href="#" className="text-sm font-medium hover:text-neutral-400 transition-colors">Instagram</Link>
          <Link href="#" className="text-sm font-medium hover:text-neutral-400 transition-colors">WhatsApp</Link>
        </div>

        {/* Column 2: Support */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Support</h3>
          <Link href="/policies/returns" className="text-sm font-medium hover:text-neutral-400 transition-colors">Returns/Exchanges</Link>
          <Link href="/policies/shipping" className="text-sm font-medium hover:text-neutral-400 transition-colors">Shipping Policy</Link>
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