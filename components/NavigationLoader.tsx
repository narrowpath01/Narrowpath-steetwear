"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import BrandLoader from "@/components/BrandLoader";

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // When pathname or searchParams change, the new page has arrived
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on links for instantaneous visual feedback
    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore links opening in new tab or external downloads
      if (
        anchor.target === "_blank" ||
        anchor.rel?.includes("external") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      // Ignore non-navigation protocols or in-page hash links
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href.startsWith("#")
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);

        // Ignore external domains
        if (url.origin !== window.location.origin) return;

        // Skip if clicking the exact same URL (same pathname and search)
        const currentUrl = new URL(window.location.href);
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        // Show brand loader immediately
        setIsLoading(true);
      } catch {
        // Fallback: ignore malformed URLs
      }
    };

    // Handle browser back / forward buttons
    const handlePopState = () => {
      setIsLoading(true);
    };

    // Global custom events for programmatic trigger if needed
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("app:loading:start", handleStart);
    window.addEventListener("app:loading:stop", handleStop);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("app:loading:start", handleStart);
      window.removeEventListener("app:loading:stop", handleStop);
    };
  }, []);

  // Safety timeout in case navigation is cancelled or network fails
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return <BrandLoader />;
}
