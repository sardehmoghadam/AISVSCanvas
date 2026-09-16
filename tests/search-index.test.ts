import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildSearchIndex } from "../lib/search";
import { ReviewStatusSchema } from "../lib/content/schema";
import { standard } from "../config/standard";

/**
 * Contract tests for the build-time search index (`lib/search.ts`).
 *
 * Search is generated from the MDX corpus at build time, so a control that
 * never reaches the index is silently unsearchable even though its page builds
 * fine. These tests assert the index stays complete, unique, ordered, and
 * populated with the fields the client UI renders.
 */

const CONTROLS_DIR = path.join(process.cwd(), "content", "controls");

const controlFiles = fs
  .readdirSync(CONTROLS_DIR)
  .filter((file) => file.endsWith(".mdx"));

const index = buildSearchIndex();

describe("search index", () => {
  it("indexes exactly one entry per control file", () => {
    expect(index.length).toBe(controlFiles.length);
    expect(index.length).toBeGreaterThan(0);
  });

  it("covers every control on disk", () => {
    const expected = controlFiles.map(
      (file) => `/controls/${file.replace(/\.mdx$/, "")}/`,
    );
    const indexed = new Set(index.map((entry) => entry.href));
    expect(expected.filter((href) => !indexed.has(href))).toEqual([]);
  });

  it("gives every control a unique, well-formed route", () => {
    const hrefs = index.map((entry) => entry.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);

    const malformed = hrefs.filter(
      (href) => !/^\/controls\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(href),
    );
    expect(malformed).toEqual([]);
  });

  it("keeps natural control-id order", () => {
    const ids = index.map((entry) => entry.controlId);
    expect(ids).toEqual([...ids].sort(standard.compareControlIds));
  });

  it("populates every field the search UI renders", () => {
    const incomplete = index
      .filter(
        (entry) =>
          !entry.controlId ||
          !entry.title ||
          !entry.summary ||
          !entry.chapterId ||
          !entry.chapterTitle ||
          !entry.difficulty ||
          !entry.searchText,
      )
      .map((entry) => entry.href);
    expect(incomplete).toEqual([]);
  });

  it("exports levels as display labels", () => {
    const unlabelled = index
      .filter((entry) => entry.levels.some((level) => !/^Level \d+$/.test(level)))
      .map((entry) => entry.href);
    expect(unlabelled).toEqual([]);
  });

  it("exports only review statuses the schema allows", () => {
    const invalid = index
      .filter(
        (entry) => !ReviewStatusSchema.safeParse(entry.reviewStatus).success,
      )
      .map((entry) => entry.href);
    expect(invalid).toEqual([]);
  });

  it("folds id, title, chapter, tags, and keywords into a lowercase searchText", () => {
    const failures: string[] = [];
    for (const entry of index) {
      if (entry.searchText !== entry.searchText.toLowerCase()) {
        failures.push(`${entry.controlId}: searchText is not lowercase`);
      }

      const needles = [
        entry.controlId,
        entry.title,
        entry.chapterId,
        ...entry.tags,
        ...entry.keywords,
      ];
      for (const needle of needles) {
        if (!entry.searchText.includes(needle.toLowerCase())) {
          failures.push(`${entry.controlId}: searchText is missing "${needle}"`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("includes each control's own body text", () => {
    const missing = index
      .filter((entry) => !entry.searchText.includes("what this control means"))
      .map((entry) => entry.href);
    expect(missing).toEqual([]);
  });
});
