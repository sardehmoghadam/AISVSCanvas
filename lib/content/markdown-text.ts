/**
 * Converts an MDX/markdown body into a plain-text haystack for search indexing.
 *
 * The aim is high recall rather than perfectly clean prose: code fences and
 * markdown/HTML syntax are removed so natural-language queries match the
 * narrative text. Any residual text (for example MDX component attributes) is
 * harmless extra searchable content.
 */
export function stripMarkdownToText(markdown: string): string {
  let text = markdown;

  // Drop fenced code blocks (``` … ``` and ~~~ … ~~~).
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/~~~[\s\S]*?~~~/g, " ");

  // Convert images and links to their label text.
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, " $1 ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, " $1 ");

  // Strip HTML/MDX tags, preserving the text between paired tags.
  text = text.replace(/<[^>]+>/g, " ");

  // Strip list / heading / blockquote markers that open a line.
  text = text.replace(/^\s{0,3}(?:[>#*+-]+|\d+\.)\s+/gm, " ");

  // Strip inline emphasis/strong/strikethrough/code markers.
  text = text.replace(/[*_~`]/g, " ");

  // Strip table cell separators.
  text = text.replace(/\|/g, " ");

  // Collapse all whitespace runs to a single space.
  return text.replace(/\s+/g, " ").trim();
}
