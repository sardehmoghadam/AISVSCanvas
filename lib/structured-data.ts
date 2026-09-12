import { absoluteUrl, SITE_URL } from "./site-config";
import { standard } from "../config/standard";

export type JsonLdValue = Record<string, unknown>;

/**
 * Site-wide structured data. A single @graph links the Organization (and its
 * logo) to the WebSite so Google can associate the brand name and canonical URL
 * across every page.
 */
export const websiteJsonLd: JsonLdValue = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: standard.academyName,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon.png"),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: standard.academyName,
      url: absoluteUrl("/"),
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export type BreadcrumbEntry = { name: string; url: string };

/**
 * BreadcrumbList mirroring the visible breadcrumb trail, using absolute
 * production URLs so crawlers can resolve every node regardless of base path.
 */
export function breadcrumbListJsonLd(items: BreadcrumbEntry[]): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Resolve a level id to its human-readable label (falls back to the id). */
function levelLabel(id: string): string {
  return standard.levels.find((level) => level.id === id)?.label ?? id;
}

export type ControlJsonLdParams = {
  url: string;
  title: string;
  summary: string;
  controlId: string;
  standardVersion: string;
  levels: string[];
  tags: string[];
  groupTitle: string;
};

/**
 * Marks a single control page as both a TechArticle (technical how-to for one
 * requirement) and a LearningResource (one lesson of the training course). The
 * group title supplies articleSection; tags supply about/keywords.
 */
export function controlJsonLd(params: ControlJsonLdParams): JsonLdValue {
  const data: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": ["TechArticle", "LearningResource"],
    "@id": `${params.url}#article`,
    headline: params.title,
    name: params.title,
    description: params.summary,
    url: params.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": params.url },
    inLanguage: "en",
    articleSection: params.groupTitle,
    identifier: {
      "@type": "PropertyValue",
      propertyID: `${standard.name} ${params.standardVersion}`,
      value: params.controlId,
    },
    learningResourceType: "lesson",
    isPartOf: {
      "@type": "Course",
      name: standard.academyName,
      url: absoluteUrl("/"),
    },
    author: {
      "@type": "Organization",
      name: standard.academyName,
      url: absoluteUrl("/"),
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  if (params.levels.length > 0) {
    data.educationalLevel = params.levels.map(levelLabel).join(", ");
  }
  if (params.tags.length > 0) {
    data.keywords = params.tags.join(", ");
    data.about = params.tags.map((tag) => ({ "@type": "Thing", name: tag }));
  }

  return data;
}