import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { SiteChrome } from "@/components/SiteChrome";

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
                function clean() {
                  var els = document.querySelectorAll('[bis_skin_checked]');
                  for (var i = 0; i < els.length; i++) {
                    els[i].removeAttribute('bis_skin_checked');
                  }
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', clean, { once: true });
                } else {
                  clean();
                }
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 text-black" suppressHydrationWarning>
        <SessionProvider>
          <SiteChrome>{children}</SiteChrome>
        </SessionProvider>
      </body>
    </html>
  );
}