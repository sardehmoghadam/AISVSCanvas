import type { MetadataRoute } from "next";
import { categories } from "@/content/categories";
import { sections } from "@/content/sections";
import { getAllControls } from "@/lib/content/loader";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const uniqueControlSlugs = getAllControls().map((entry) => entry.frontmatter.slug);

  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/contribute/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  for (const category of categories) {
    entries.push({
      url: `${SITE_URL}/categories/${category.slug}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const section of sections) {
    entries.push({
      url: `${SITE_URL}/sections/${section.slug}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const slug of uniqueControlSlugs) {
    entries.push({
      url: `${SITE_URL}/controls/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
