/**
 * Heading extraction and slugification for the "On this page" table of contents.
 *
 * MDX content is rendered from plain markdown bodies, so headings receive their
 * `id` attributes here (via createMdHeading) rather than from a rehype plugin.
 * `extractHeadings` reads the same `##`-style headings from the raw body so the
 * sidebar always matches the rendered page.
 */

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractHeadings(body: string): string[] {
  const headings: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    const match = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (match) {
      const label = match[1].trim();
      if (label) headings.push(label);
    }
  }
  return headings;
}
