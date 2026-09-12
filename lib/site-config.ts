import type { Metadata } from "next";
import { standard } from "../config/standard";

/**
 * Central site identity used for SEO metadata, canonical URLs, sitemaps, and
 * robots.txt. Branding and URLs are sourced from `config/standard.ts` so a new
 * standard only needs a config swap.
 *
 * Canonical URLs always point at the production GitHub Pages location (which is
 * served under the /<repo> base path) regardless of whether the site is built
 * locally (no base path) or in CI (base path applied).
 */
export const SITE_URL = standard.siteUrl;

/** Build an absolute production URL from an internal path. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Shared Open Graph block so every page produces a consistent, crawlable link
 * preview. Next.js replaces (rather than deep-merges) `openGraph` per segment,
 * so each page must carry the image, site name, type, and locale explicitly.
 */
export function buildOpenGraph(params: {
  title: string;
  description: string;
  url: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: standard.academyName,
    locale: "en_US",
    url: params.url,
    title: params.title,
    description: params.description,
    images: [
      {
        url: absoluteUrl("/opengraph-image.png"),
        width: 1200,
        height: 630,
        alt: standard.academyName,
      },
    ],
  };
}
