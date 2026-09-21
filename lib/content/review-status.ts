import type { BadgeVariant } from "@/components/ui/badge";
import type { ReviewStatus } from "./schema";

/**
 * Presentation layer for the `reviewStatus` frontmatter field.
 *
 * The vocabulary itself lives in `ReviewStatusSchema`; this module is the single
 * place that maps each status to the label, colour, and explanation the UI
 * renders, so the category, section, control, and search views cannot drift
 * apart. Labels are always human-readable and always differ per status, which
 * keeps the state readable without relying on colour alone.
 */

/** Canonical order used wherever the statuses are listed, e.g. the legend. */
export const REVIEW_STATUS_ORDER: readonly ReviewStatus[] = ["draft", "reviewed", "needs-update"];

/** Human-readable label rendered inside the badge. */
export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  "needs-update": "Needs update",
};

/**
 * Badge variant per status.
 *
 * Every status maps to a distinct variant: two statuses sharing one variant is
 * exactly the ambiguity this module exists to prevent.
 */
export const REVIEW_STATUS_BADGE_VARIANT: Record<ReviewStatus, BadgeVariant> = {
  draft: "secondary",
  reviewed: "success",
  "needs-update": "warning",
};

/** One-line explanation, used by the legend and the badge tooltip. */
export const REVIEW_STATUS_DESCRIPTION: Record<ReviewStatus, string> = {
  draft: "AI-assisted draft that no reviewer has checked against the standard yet.",
  reviewed: "Read and approved against the standard by a human reviewer.",
  "needs-update": "Was reviewed, but the guidance or tooling it covers has moved on.",
};

function isReviewStatus(value: string): value is ReviewStatus {
  return (REVIEW_STATUS_ORDER as readonly string[]).includes(value);
}

/** Resolve a status to its label (falls back to the raw value). */
export function reviewStatusLabel(status: string): string {
  return isReviewStatus(status) ? REVIEW_STATUS_LABEL[status] : status;
}

/** Resolve a status to its badge variant (falls back to the neutral variant). */
export function reviewStatusBadgeVariant(status: string): BadgeVariant {
  return isReviewStatus(status) ? REVIEW_STATUS_BADGE_VARIANT[status] : "secondary";
}

/** Resolve a status to its explanation (falls back to a generic note). */
export function reviewStatusDescription(status: string): string {
  return isReviewStatus(status) ? REVIEW_STATUS_DESCRIPTION[status] : "Unrecognized review status.";
}
