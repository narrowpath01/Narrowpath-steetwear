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
            className="group flex items-center gap-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-[1.5] text-neutral-400 group-hover:text-[#E1306C] transition-colors" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
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
            className="group flex items-center gap-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 fill-current text-neutral-400 group-hover:text-[#25D366] transition-colors" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
            </svg>
            WhatsApp (+91 9315457852)
          </a>
          <a 
            href="https://wa.me/919894781426" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center gap-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 fill-current text-neutral-400 group-hover:text-[#25D366] transition-colors" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
            </svg>
            WhatsApp (+91 9894781426)
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