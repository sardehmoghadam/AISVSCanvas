import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  ControlFrontmatterSchema,
  type ControlFrontmatter,
} from "../lib/content/schema";

/**
 * Content-integrity tests for the MDX control corpus.
 *
 * The MDX files under `content/controls/` are the source of truth. These tests
 * validate the same frontmatter schema the build uses, plus structural rules
 * that keep the 300+ authored pages consistent as new controls are added.
 */

const CONTROLS_DIR = path.join(process.cwd(), "content", "controls");

const REQUIRED_SECTIONS = [
  "## What This Control Means",
  "## Why This Matters",
  "## Main Security Requirement",
  "## Common Failure Patterns",
  "## Secure Implementation",
  "## Key Rules",
  "## Checklist for Code Review",
] as const;

type LoadedControl = {
  file: string;
  slug: string;
  frontmatter: ControlFrontmatter | null;
  body: string;
  error: string | null;
};

function loadControls(): LoadedControl[] {
  if (!fs.existsSync(CONTROLS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONTROLS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTROLS_DIR, file), "utf-8");
      const parsed = matter(raw);
      const result = ControlFrontmatterSchema.safeParse(parsed.data);

      return {
        file,
        slug: typeof parsed.data.slug === "string" ? parsed.data.slug : "",
        frontmatter: result.success ? result.data : null,
        body: parsed.content,
        error: result.success ? null : result.error.message,
      };
    });
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates];
}

function slugFromHref(href: string): string {
  return href.replace(/^\/+|\/+$/g, "").replace(/^controls\//, "");
}

const controls = loadControls();

describe("Standard control content integrity", () => {
  it("loads the full control corpus", () => {
    expect(controls.length).toBeGreaterThan(0);
  });

  it("every control passes the frontmatter schema", () => {
    const failures = controls
      .filter((control) => control.error)
      .map((control) => `${control.file}: ${control.error}`);
    expect(failures).toEqual([]);
  });

  it("control slugs are unique", () => {
    const slugs = controls
      .map((control) => control.slug)
      .filter((slug): slug is string => Boolean(slug));
    expect(findDuplicates(slugs)).toEqual([]);
  });

  it("control IDs are unique", () => {
    const ids = controls
      .map((control) => control.frontmatter?.controlId)
      .filter((id): id is string => Boolean(id));
    expect(findDuplicates(ids)).toEqual([]);
  });

  it("each control file is named after its slug", () => {
    const mismatches = controls
      .filter(
        (control) =>
          control.frontmatter && control.file !== `${control.frontmatter.slug}.mdx`,
      )
      .map(
        (control) =>
          `${control.file} -> expected ${control.frontmatter?.slug}.mdx`,
      );
    expect(mismatches).toEqual([]);
  });

  it("every body contains the seven required sections", () => {
    const failures: string[] = [];
    for (const control of controls) {
      for (const section of REQUIRED_SECTIONS) {
        if (!control.body.includes(section)) {
          failures.push(`${control.file}: missing ${section}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("Main Security Requirement preserves the verbatim AISVS blockquote", () => {
    const failures = controls
      .filter((control) => {
        const section = control.body.match(
          /## Main Security Requirement[\s\S]*?(?=\n##\s|$)/,
        );
        return !section || !/^\s*>\s*\S/m.test(section[0]);
      })
      .map((control) => control.file);
    expect(failures).toEqual([]);
  });

  it("relatedControls hrefs resolve to an existing control route", () => {
    const validSlugs = new Set(
      controls
        .map((control) => control.frontmatter?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    );

    const broken: string[] = [];
    for (const control of controls) {
      for (const related of control.frontmatter?.relatedControls ?? []) {
        if (!validSlugs.has(slugFromHref(related.href))) {
          broken.push(`${control.file}: ${related.id} -> ${related.href}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
});