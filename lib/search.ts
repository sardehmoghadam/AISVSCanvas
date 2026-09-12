import { standard } from "../config/standard";
import { getAllControls } from "./content/loader";
import { stripMarkdownToText } from "./content/markdown-text";

/**
 * A lightweight, fully-serializable record for one searchable control.
 *
 * `searchText` is a precomputed, lowercased haystack that the client searches
 * against, so filtering hundreds of controls stays instant without any JSON
 * juggling at query time.
 */
export type SearchEntry = {
  href: string;
  controlId: string;
  title: string;
  summary: string;
  chapterId: string;
  chapterTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  levels: string[];
  difficulty: string;
  reviewStatus: string;
  tags: string[];
  keywords: string[];
  references: string[];
  searchText: string;
};

/** Resolve a level id to its human-readable label (falls back to the id). */
function levelLabel(id: string): string {
  return standard.levels.find((level) => level.id === id)?.label ?? id;
}

/** Searchable terms for a single level id (id, generic label, human label). */
function levelTerms(id: string): string[] {
  const label = levelLabel(id);
  return [
    id,
    `level ${id}`,
    label,
    `${standard.name.toLowerCase()} level ${label.toLowerCase()}`,
  ];
}

/**
 * Builds the static search index from the MDX control corpus.
 *
 * Runs at build time only (server-side). Every field the user can search —
 * id, slug, title, summary, keywords, tags, chapter, section, levels,
 * difficulty, status, references, related controls, and the rendered body
 * text — is folded into `searchText`.
 */
export function buildSearchIndex(): SearchEntry[] {
  return getAllControls()
    .map((entry) => {
      const fm = entry.frontmatter;
      const references = fm.references.map((ref) => ref.label);
      const bodyText = stripMarkdownToText(entry.body);
      const levels = fm.levels.map(levelLabel);

      const searchText = [
        fm.controlId,
        fm.canonicalId ?? "",
        fm.slug,
        fm.title,
        fm.summary,
        fm.chapter.id,
        fm.chapter.title,
        fm.section?.id ?? "",
        fm.section?.title ?? "",
        ...fm.levels.flatMap(levelTerms),
        fm.difficulty,
        fm.reviewStatus,
        ...fm.tags,
        ...fm.keywords,
        ...references,
        ...fm.relatedControls.map((rc) => `${rc.id} ${rc.title}`),
        bodyText,
      ]
        .join(" ")
        .toLowerCase();

      return {
        href: `/controls/${fm.slug}/`,
        controlId: fm.controlId,
        title: fm.title,
        summary: fm.summary,
        chapterId: fm.chapter.id,
        chapterTitle: fm.chapter.title,
        sectionId: fm.section?.id,
        sectionTitle: fm.section?.title,
        levels,
        difficulty: fm.difficulty,
        reviewStatus: fm.reviewStatus,
        tags: fm.tags,
        keywords: fm.keywords,
        references,
        searchText,
      };
    })
    .sort((a, b) => standard.compareControlIds(a.controlId, b.controlId));
}
