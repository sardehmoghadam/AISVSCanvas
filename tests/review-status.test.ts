import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ReviewStatusSchema } from "../lib/content/schema";
import {
  REVIEW_STATUS_BADGE_VARIANT,
  REVIEW_STATUS_DESCRIPTION,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_ORDER,
  reviewStatusBadgeVariant,
  reviewStatusDescription,
  reviewStatusLabel,
} from "../lib/content/review-status";

/**
 * Contract tests for the review-status presentation layer
 * (`lib/content/review-status.ts`) and the views that consume it.
 *
 * A reader has to be able to tell a `reviewed` control from a `needs-update`
 * one, so the mapping must keep every status verbally (and visually) distinct,
 * cover the whole schema vocabulary, and survive a status the schema does not
 * know about. Rendering the raw frontmatter value was the original bug: both
 * statuses came out as identical `<Badge variant="secondary">` chips.
 */

const STATUSES = ReviewStatusSchema.options;

/** Every view that shows a control's review status to a reader. */
const RENDER_SITES = [
  { file: path.join("app", "categories", "[slug]", "page.tsx"), legend: true },
  { file: path.join("app", "sections", "[slug]", "page.tsx"), legend: true },
  { file: path.join("app", "controls", "[slug]", "page.tsx"), legend: false },
  { file: path.join("components", "search-client.tsx"), legend: true },
];

describe("review status presentation", () => {
  it("covers exactly the statuses the schema allows", () => {
    expect([...REVIEW_STATUS_ORDER].sort()).toEqual([...STATUSES].sort());
  });

  it("gives every status a distinct, readable label", () => {
    const labels = STATUSES.map((status) => REVIEW_STATUS_LABEL[status]);

    expect(labels.filter((label) => label.trim().length === 0)).toEqual([]);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("does not label a status with its own raw value", () => {
    const unresolved = STATUSES.filter(
      (status) => REVIEW_STATUS_LABEL[status] === status,
    );
    expect(unresolved).toEqual([]);
  });

  it("paints every status with a different badge variant", () => {
    const variants = STATUSES.map((status) => REVIEW_STATUS_BADGE_VARIANT[status]);
    expect(new Set(variants).size).toBe(variants.length);
  });

  it("explains every status in the legend copy", () => {
    const descriptions = STATUSES.map((status) => REVIEW_STATUS_DESCRIPTION[status]);

    expect(descriptions.filter((text) => text.trim().length <= 10)).toEqual([]);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("resolves a known status through every helper", () => {
    for (const status of STATUSES) {
      expect(reviewStatusLabel(status)).toBe(REVIEW_STATUS_LABEL[status]);
      expect(reviewStatusBadgeVariant(status)).toBe(REVIEW_STATUS_BADGE_VARIANT[status]);
      expect(reviewStatusDescription(status)).toBe(REVIEW_STATUS_DESCRIPTION[status]);
    }
  });

  it("degrades gracefully for a status the schema does not know", () => {
    for (const status of ["", "published", "NEEDS-UPDATE"]) {
      expect(reviewStatusLabel(status)).toBe(status);
      expect(reviewStatusBadgeVariant(status)).toBe("secondary");
      expect(reviewStatusDescription(status).trim().length).toBeGreaterThan(0);
    }
  });

  it("renders statuses through the shared component, never the raw value", () => {
    const failures = RENDER_SITES.flatMap(({ file, legend }) => {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      const problems: string[] = [];

      if (!source.includes("ReviewStatusBadge")) {
        problems.push(`${file}: does not render ReviewStatusBadge`);
      }
      if (/reviewStatus\}\s*<\/Badge>/.test(source)) {
        problems.push(`${file}: renders the raw reviewStatus inside a Badge`);
      }
      if (legend && !source.includes("ReviewStatusLegend")) {
        problems.push(`${file}: does not render the ReviewStatusLegend`);
      }

      return problems;
    });

    expect(failures).toEqual([]);
  });
});
