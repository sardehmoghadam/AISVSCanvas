import { afterAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import {
  controls,
  normalizeReviewStatus,
  parseReviewStatus,
  readReviewState,
  reviewStatusFor,
  writeControls,
} from "../scripts/generate-aisvs-content.mjs";

/**
 * Regression tests for review-state preservation in the content generator.
 *
 * The generator deletes and rewrites every control file on each run, so review
 * state has to be snapshotted before that happens. Without the snapshot, running
 * `node scripts/generate-aisvs-content.mjs` - which the docs tell contributors to
 * do - would silently reset every reviewed control back to `draft`.
 */

const GENERATOR = path.join(process.cwd(), "scripts", "generate-aisvs-content.mjs");
const CONTROLS_DIR = path.join(process.cwd(), "content", "controls");

const tmpDirs: string[] = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aisvs-review-"));
  tmpDirs.push(dir);
  return dir;
}

function controlFile(dir: string, slug: string) {
  return path.join(dir, `${slug}.mdx`);
}

function reviewStatusIn(file: string) {
  return matter(fs.readFileSync(file, "utf8")).data.reviewStatus;
}

/** Rewrite one control's review status on disk, leaving the rest of the file alone. */
function markStatus(file: string, status: string) {
  const text = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, text.replace(/^reviewStatus: .*$/m, `reviewStatus: ${status}`));
}

function firstControlFile() {
  const file = fs.readdirSync(CONTROLS_DIR).find((entry) => entry.endsWith(".mdx"));
  return path.join(CONTROLS_DIR, file as string);
}

afterAll(() => {
  for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });
});

describe("normalizeReviewStatus", () => {
  it("accepts every status the schema allows", () => {
    for (const status of ["draft", "reviewed", "needs-update"]) {
      expect(normalizeReviewStatus(status)).toBe(status);
    }
  });

  it("rejects unrecognized and non-string values", () => {
    for (const value of ["published", "", "Reviewed", null, undefined, 1, {}]) {
      expect(normalizeReviewStatus(value)).toBeNull();
    }
  });
});

describe("parseReviewStatus", () => {
  it("reads reviewStatus out of real control frontmatter", () => {
    expect(parseReviewStatus(fs.readFileSync(firstControlFile(), "utf8"))).toBe("draft");
  });

  it("returns null when reviewStatus is absent or unknown", () => {
    expect(parseReviewStatus("---\ncontrolId: C1.1.1\n---\n\nbody\n")).toBeNull();
    expect(parseReviewStatus("---\nreviewStatus: shipped\n---\n\nbody\n")).toBeNull();
  });
});

describe("readReviewState", () => {
  it("keys the snapshot by control id and by slug", () => {
    const dir = makeTmpDir();
    const [control] = controls;
    writeControls([control], dir, new Map());
    markStatus(controlFile(dir, control.slug), "needs-update");

    const state = readReviewState(dir);
    expect(state.get(control.controlId)).toBe("needs-update");
    expect(state.get(control.slug)).toBe("needs-update");
  });

  it("ignores unrecognized statuses and missing directories", () => {
    const dir = makeTmpDir();
    const [control] = controls;
    writeControls([control], dir, new Map());
    markStatus(controlFile(dir, control.slug), "shipped");

    expect(readReviewState(dir).size).toBe(0);
    expect(readReviewState(path.join(dir, "missing")).size).toBe(0);
  });
});

describe("reviewStatusFor", () => {
  const control = { controlId: "C1.1.1", slug: "c1-1-1-example" };

  it("defaults to draft when nothing was preserved", () => {
    expect(reviewStatusFor(control, new Map())).toBe("draft");
  });

  it("prefers the control id so a retitled control keeps its status", () => {
    const preserved = new Map([
      ["C1.1.1", "reviewed"],
      ["c1-1-1-example", "draft"],
    ]);
    expect(reviewStatusFor({ controlId: "C1.1.1", slug: "c1-1-1-renamed" }, preserved)).toBe("reviewed");
  });

  it("falls back to the slug when the control id is unknown", () => {
    expect(reviewStatusFor(control, new Map([["c1-1-1-example", "reviewed"]]))).toBe("reviewed");
  });
});

describe("writeControls", () => {
  it("writes every control as draft into a fresh directory", () => {
    const dir = makeTmpDir();
    writeControls(controls, dir, new Map());

    const files = fs.readdirSync(dir).filter((file) => file.endsWith(".mdx"));
    expect(files).toHaveLength(controls.length);
    for (const file of files) {
      expect(reviewStatusIn(path.join(dir, file))).toBe("draft");
    }
  });

  it("preserves a reviewed control across a regeneration", () => {
    const dir = makeTmpDir();
    writeControls(controls, dir, new Map());

    const reviewed = controls[3];
    markStatus(controlFile(dir, reviewed.slug), "reviewed");

    // The sequence the real script performs: snapshot first, then rewrite.
    writeControls(controls, dir, readReviewState(dir));

    expect(reviewStatusIn(controlFile(dir, reviewed.slug))).toBe("reviewed");
    for (const other of controls.filter((c) => c.slug !== reviewed.slug)) {
      expect(reviewStatusIn(controlFile(dir, other.slug))).toBe("draft");
    }
  });

  it("keeps the status of a control whose slug changed", () => {
    const dir = makeTmpDir();
    const control = controls[0];
    writeControls([control], dir, new Map());
    markStatus(controlFile(dir, control.slug), "reviewed");

    const preserved = readReviewState(dir);
    const retitled = { ...control, slug: `${control.slug}-renamed` };
    writeControls([retitled], dir, preserved);

    expect(reviewStatusIn(controlFile(dir, retitled.slug))).toBe("reviewed");
  });

  it("removes control files that are no longer generated", () => {
    const dir = makeTmpDir();
    const stale = controlFile(dir, controls[0].slug);
    writeControls(controls.slice(0, 2), dir, new Map());
    expect(fs.existsSync(stale)).toBe(true);

    writeControls([controls[1]], dir, new Map());
    expect(fs.existsSync(stale)).toBe(false);
  });
});

describe("script entry point", () => {
  it("does not regenerate the corpus when the module is imported", () => {
    const sample = firstControlFile();
    const before = fs.statSync(sample).mtimeMs;

    // Run in a fresh process so the module is evaluated from scratch instead of
    // being served from the import cache. Importing must not write to content/.
    execFileSync(
      process.execPath,
      ["-e", `import(${JSON.stringify(pathToFileURL(GENERATOR).href)})`],
      { cwd: process.cwd(), stdio: "pipe" },
    );

    expect(fs.statSync(sample).mtimeMs).toBe(before);
    expect(fs.readdirSync(CONTROLS_DIR).filter((file) => file.endsWith(".mdx"))).toHaveLength(
      controls.length,
    );
  });
});
