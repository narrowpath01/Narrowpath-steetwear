import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import CartDrawer from "@/components/CartDrawer";
import SessionProvider from "@/components/SessionProvider";
import { Footer } from "@/components/Footer"; 
import CartInitializer from "@/components/CartInitializer";
import WishlistInitializer from "@/components/WishlistInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Narrow Path | Premium Streetwear",
  description: "Walk by faith, not by sight. Official store for Narrow Path.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="bis-cleaner"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                function clean(node) {
                  if (!node || node.nodeType !== 1) return;
                  if (node.hasAttribute && node.hasAttribute('bis_skin_checked')) {
                    node.removeAttribute('bis_skin_checked');
                  }
                  if (node.getElementsByTagName) {
                    var children = node.getElementsByTagName('*');
                    for (var i = 0; i < children.length; i++) {
                      if (children[i].hasAttribute && children[i].hasAttribute('bis_skin_checked')) {
                        children[i].removeAttribute('bis_skin_checked');
                      }
                    }
                  }
                }

                // Clean root and any loaded DOM instantly
                clean(document.documentElement);

                const observer = new MutationObserver(function(mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    if (m.type === 'childList') {
                      var added = m.addedNodes;
                      for (var j = 0; j < added.length; j++) {
                        clean(added[j]);
                      }
                    } else if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                      var target = m.target;
                      if (target.hasAttribute && target.hasAttribute('bis_skin_checked')) {
                        target.removeAttribute('bis_skin_checked');
                      }
                    }
                  }
                });

                observer.observe(document.documentElement, { 
                  childList: true, 
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['bis_skin_checked']
                });
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 text-black" suppressHydrationWarning>
        <SessionProvider>
          <Navbar /> 
          <CartDrawer />
          {children}
          <Footer />
          <CartInitializer />
          <WishlistInitializer />
        </SessionProvider>
      </body>
    </html>
  );
}