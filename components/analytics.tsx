"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 (gtag.js) loader + page-view tracking.
 *
 * Renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset, so local and
 * CI builds without the variable stay clean. The inline init snippet fires the
 * initial page_view; subsequent client-side route changes re-send it via the
 * pathname effect below.
 */
export function Analytics() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The inline init snippet already fired the initial page_view, so skip the
    // very first render and only re-send on client-side navigation.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!GA_ID || typeof window.gtag !== "function") return;

    const pagePath = window.location.pathname + window.location.search;
    window.gtag("config", GA_ID, {
      page_path: pagePath,
      page_title: document.title,
    });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="ga4-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`,
        }}
      />
    </>
  );
}
