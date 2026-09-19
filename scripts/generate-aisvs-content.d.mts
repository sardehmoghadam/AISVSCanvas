/**
 * Type surface for `generate-aisvs-content.mjs`.
 *
 * The generator is plain JavaScript (`allowJs` is off), so the review-state
 * helpers covered by `tests/generate-preserve-review.test.ts` are declared here.
 * Keep this in sync with the exports at the bottom of the script.
 */

/** A generated control as produced by the generator's requirement table. */
export interface GeneratedControl {
  controlId: string;
  slug: string;
  [key: string]: unknown;
}

/** Coerce a frontmatter value to a known review status, or `null` if unrecognized. */
export function normalizeReviewStatus(value: unknown): string | null;

/** Read the `reviewStatus` out of a single control file's text. */
export function parseReviewStatus(text: string): string | null;

/**
 * Snapshot the review state of the controls on disk, keyed by both control id
 * and slug so a retitled control keeps the state it was given.
 */
export function readReviewState(dir: string): Map<string, string>;

/** The review status to emit for a control, given a snapshot from `readReviewState`. */
export function reviewStatusFor(
  control: Pick<GeneratedControl, "controlId" | "slug">,
  preserved: Map<string, string>,
): string;

/** Rewrite every control file in `dir`, restoring review state from `preserved`. */
export function writeControls(
  list: readonly GeneratedControl[],
  dir: string,
  preserved: Map<string, string>,
): void;

/** The full generated control list. */
export const controls: readonly GeneratedControl[];
