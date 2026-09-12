/**
 * Single source of truth for the standard that powers this site.
 *
 * Everything standard-specific — identity, branding, version, ID shapes,
 * hierarchy, and levels — lives here. Components, pages, content loaders, and
 * the Zod schema all read from this object, so standing up a site for a
 * different OWASP standard only requires swapping this file (and the content
 * under `content/`), with no changes to the React code.
 *
 * The default configuration points at OWASP AISVS 1.0.
 */

export type LevelOption = {
  /** Machine id used in frontmatter `levels`, e.g. "1" or "L1". */
  id: string;
  /** Human-readable label, e.g. "Level 1" or "L1 — Standard Security". */
  label: string;
};

export type StandardConfig = {
  /** Machine id, e.g. "aisvs". */
  id: string;
  /** Short acronym rendered in UI, e.g. "AISVS". */
  name: string;
  /** Brand used as the site/academy name, e.g. "AISVS Academy". */
  academyName: string;
  /** Full standard name, e.g. "Artificial Intelligence Security Verification Standard". */
  fullName: string;
  /** Version tag rendered in UI, e.g. "1.0". */
  version: string;
  /** Absolute production base URL (GitHub Pages project site). */
  siteUrl: string;
  /** Repository name used as the GitHub Pages base path in CI. */
  repoName: string;
  /** One-line site description used for SEO and hero copy. */
  description: string;
  /** SEO keywords for the root layout metadata. */
  keywords: string[];
  /** Canonical OWASP project URL for the standard. */
  standardUrl: string;
  /** Slug of the first category; drives "Start learning" CTAs. */
  startCategorySlug: string;
  /** Whether the standard has a section layer between groups and controls. */
  hasSections: boolean;
  /** Singular UI label for the top-level grouping, e.g. "chapter". */
  groupLabel: string;
  /** Plural UI label for the top-level grouping, e.g. "chapters". */
  groupLabelPlural: string;
  /** Singular UI label for the mid-level grouping, e.g. "section". */
  sectionLabel: string;
  /** Plural UI label for the mid-level grouping, e.g. "sections". */
  sectionLabelPlural: string;
  /** Regexes describing the id shapes used by the standard. */
  groupIdPattern: RegExp;
  sectionIdPattern: RegExp;
  controlIdPattern: RegExp;
  canonicalIdPattern: RegExp;
  /** Example ids used to make schema error messages readable. */
  examples: {
    groupId: string;
    sectionId: string;
    controlId: string;
    canonicalId: string;
  };
  /** Levels a control may be tagged with in frontmatter `levels`. */
  levels: LevelOption[];
  /** Derive the group id (e.g. "C1") from a control id. */
  deriveGroupId(controlId: string): string;
  /** Derive the section id (e.g. "C1.1"), or null when hasSections is false. */
  deriveSectionId(controlId: string): string | null;
  /** Build the canonical id (e.g. "v1.0-C1.1.1") from a control id. */
  buildCanonicalId(controlId: string): string;
  /** Natural ordering for control ids (so C10 sorts after C9). */
  compareControlIds(a: string, b: string): number;
};

export const standard: StandardConfig = {
  id: "aisvs",
  name: "AISVS",
  academyName: "AISVS Academy",
  fullName: "Artificial Intelligence Security Verification Standard",
  version: "1.0",
  siteUrl: "https://sardehmoghadam.github.io/AISVSCanvas",
  repoName: "AISVSCanvas",
  description:
    "Free, open-source OWASP AISVS 1.0 training with plain-English explanations, AI-specific verification guidance, and review checklists for every requirement across the AI lifecycle.",
  keywords: [
    "OWASP AISVS",
    "AI security",
    "LLM security",
    "AI security verification",
    "prompt injection",
    "secure AI development",
  ],
  standardUrl: "https://github.com/OWASP/AISVS",
  startCategorySlug: "c1-training-data-integrity-and-traceability",
  hasSections: true,
  groupLabel: "chapter",
  groupLabelPlural: "chapters",
  sectionLabel: "section",
  sectionLabelPlural: "sections",
  groupIdPattern: /^C\d{1,2}$/,
  sectionIdPattern: /^C\d{1,2}\.\d+$/,
  controlIdPattern: /^C\d{1,2}\.\d+\.\d+$/,
  canonicalIdPattern: /^v1\.0-C\d{1,2}\.\d+\.\d+$/,
  examples: {
    groupId: "C1",
    sectionId: "C1.1",
    controlId: "C1.1.1",
    canonicalId: "v1.0-C1.1.1",
  },
  levels: [
    { id: "1", label: "Level 1" },
    { id: "2", label: "Level 2" },
    { id: "3", label: "Level 3" },
  ],
  deriveGroupId(controlId: string): string {
    return `C${controlId.slice(1).split(".")[0]}`;
  },
  deriveSectionId(controlId: string): string | null {
    const [chapter, section] = controlId.slice(1).split(".");
    return `C${chapter}.${section}`;
  },
  buildCanonicalId(controlId: string): string {
    return `v${this.version}-${controlId}`;
  },
  compareControlIds(a: string, b: string): number {
    const pa = a.slice(1).split(".").map(Number);
    const pb = b.slice(1).split(".").map(Number);
    return (pa[0] - pb[0]) || (pa[1] - pb[1]) || (pa[2] - pb[2]);
  },
};
