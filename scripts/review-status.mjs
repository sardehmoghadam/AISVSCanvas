// Reports the human-review status of every authored control under
// content/controls/, so maintainers can see at a glance how much of the corpus
// is still `draft` versus `reviewed`, and which controls need a fresh look.
//
// Pure Node plus gray-matter -- the same frontmatter parser the content loader
// (lib/content/loader.ts) and the content-validation tests use, so this report
// can never disagree with what the build sees.
//
// Run from the repo root:
//   node scripts/review-status.mjs
//   node scripts/review-status.mjs --list draft
//   node scripts/review-status.mjs --chapter C2 --format markdown
//   node scripts/review-status.mjs --fail-on needs-update
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTROLS_DIR = path.join(ROOT, "content", "controls");
const CONTROLS_LABEL = path.relative(ROOT, CONTROLS_DIR).split(path.sep).join("/");

/** Must mirror ReviewStatusSchema in lib/content/schema.ts. */
const STATUSES = ["draft", "reviewed", "needs-update"];
/** Mirrors ControlFrontmatterSchema's `.default("draft")`. */
const DEFAULT_STATUS = "draft";
/** Rendered top-down; `unknown` collects unrecognized frontmatter values. */
const REPORT_ORDER = ["reviewed", "draft", "needs-update", "unknown"];

const USAGE = `Report the human-review status of the control corpus.

Usage:
  node scripts/review-status.mjs [options]

Options:
  --list <status|all>   Also list matching controls (draft, reviewed,
                        needs-update, unknown, all).
  --chapter <C1>        Only consider controls in one chapter.
  --format <format>     table (default), markdown, or json.
  --json                Shorthand for --format json.
  --markdown            Shorthand for --format markdown.
  --fail-on <statuses>  Comma-separated statuses that should fail the run,
                        e.g. --fail-on needs-update.
  --strict              Shorthand for --fail-on needs-update,unknown.
  -h, --help            Show this message.

Exit codes:
  0  Report produced, no --fail-on status matched.
  1  At least one requested --fail-on status matched.
  2  Usage error, missing content directory, or unreadable frontmatter.
`;

class UsageError extends Error {}

function parseArgs(argv) {
  const options = {
    list: null,
    chapter: null,
    format: "table",
    failOn: [],
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (next === undefined || next.startsWith("--")) {
        throw new UsageError(`${arg} requires a value`);
      }
      index += 1;
      return next;
    };

    switch (arg) {
      case "--list":
        options.list = value();
        break;
      case "--chapter":
        options.chapter = value().toUpperCase();
        break;
      case "--format":
        options.format = value();
        break;
      case "--fail-on":
        options.failOn.push(
          ...value()
            .split(",")
            .map((status) => status.trim())
            .filter(Boolean),
        );
        break;
      case "--strict":
        options.failOn.push("needs-update", "unknown");
        break;
      case "--json":
        options.format = "json";
        break;
      case "--markdown":
        options.format = "markdown";
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        throw new UsageError(`Unknown option: ${arg}`);
    }
  }

  if (!["table", "markdown", "json"].includes(options.format)) {
    throw new UsageError(`Unsupported --format: ${options.format}`);
  }
  if (options.list && options.list !== "all" && !isKnownStatus(options.list)) {
    throw new UsageError(`Unsupported --list status: ${options.list}`);
  }
  for (const status of options.failOn) {
    if (!isKnownStatus(status)) {
      throw new UsageError(`Unsupported --fail-on status: ${status}`);
    }
  }

  return options;
}

function isKnownStatus(status) {
  return STATUSES.includes(status) || status === "unknown";
}

/**
 * Reads `reviewStatus`, distinguishing "absent" (the schema defaults it to
 * draft) from "present but unrecognized" (a frontmatter typo worth surfacing).
 */
function readStatus(data) {
  const declared =
    typeof data.reviewStatus === "string" ? data.reviewStatus.trim() : "";
  if (!declared) {
    return { declared: false, status: DEFAULT_STATUS };
  }
  return {
    declared: true,
    status: STATUSES.includes(declared) ? declared : "unknown",
  };
}

function loadControls() {
  if (!fs.existsSync(CONTROLS_DIR)) {
    throw new Error(`No content directory at ${CONTROLS_LABEL}`);
  }

  return fs
    .readdirSync(CONTROLS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTROLS_DIR, file), "utf-8");
      const { data } = matter(raw);
      const { declared, status } = readStatus(data);
      const chapter = data.chapter ?? {};

      return {
        file,
        slug:
          typeof data.slug === "string" ? data.slug : file.replace(/\.mdx$/, ""),
        controlId: typeof data.controlId === "string" ? data.controlId : "",
        title: typeof data.title === "string" ? data.title : "",
        chapterId: typeof chapter.id === "string" ? chapter.id : "",
        chapterTitle: typeof chapter.title === "string" ? chapter.title : "",
        declared,
        status,
      };
    });
}

/**
 * Mirrors standard.compareControlIds in config/standard.ts. `config/` is
 * TypeScript, which a plain Node script cannot import, so the natural-ordering
 * comparator is duplicated here in miniature.
 */
function compareControlIds(a, b) {
  const pa = a.replace(/^C/, "").split(".").map(Number);
  const pb = b.replace(/^C/, "").split(".").map(Number);
  return (pa[0] - pb[0]) || (pa[1] - pb[1]) || (pa[2] - pb[2]) || a.localeCompare(b);
}

function countByStatus(controls) {
  const counts = { draft: 0, reviewed: 0, "needs-update": 0, unknown: 0 };
  for (const control of controls) {
    counts[control.status] += 1;
  }
  return counts;
}

function share(count, total) {
  return total === 0 ? "0.0%" : `${((count / total) * 100).toFixed(1)}%`;
}

function buildReport(controls, options) {
  const scope = options.chapter
    ? controls.filter((control) => control.chapterId === options.chapter)
    : controls;

  const counts = countByStatus(scope);
  const chapterMap = new Map();
  for (const control of scope) {
    const key = control.chapterId || "?";
    if (!chapterMap.has(key)) {
      chapterMap.set(key, {
        id: key,
        title: control.chapterTitle,
        total: 0,
        counts: { draft: 0, reviewed: 0, "needs-update": 0, unknown: 0 },
      });
    }
    const entry = chapterMap.get(key);
    entry.total += 1;
    entry.counts[control.status] += 1;
    if (!entry.title && control.chapterTitle) {
      entry.title = control.chapterTitle;
    }
  }

  const byChapter = [...chapterMap.values()]
    .sort((a, b) => compareControlIds(`${a.id}.0.0`, `${b.id}.0.0`))
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      total: entry.total,
      counts: entry.counts,
      reviewedShare: share(entry.counts.reviewed, entry.total),
    }));

  const listed =
    options.list === "all"
      ? scope
      : options.list
        ? scope.filter((control) => control.status === options.list)
        : [];

  return {
    total: scope.length,
    corpusTotal: controls.length,
    scope: options.chapter ? `chapter ${options.chapter}` : "all chapters",
    counts,
    defaulted: scope.filter((control) => !control.declared).length,
    byChapter,
    listed: [...listed].sort((a, b) => compareControlIds(a.controlId, b.controlId)),
  };
}

function padEnd(text, width) {
  return text.length >= width ? text : text + " ".repeat(width - text.length);
}

function padStart(text, width) {
  return text.length >= width ? text : " ".repeat(width - text.length) + text;
}

function renderTable(report) {
  const lines = [];
  lines.push("AISVS Academy - control review status");
  lines.push(
    `Scanned ${report.total} controls in ${CONTROLS_LABEL} (${report.scope})`,
  );
  lines.push("");

  const statusWidth = Math.max(
    "Status".length,
    ...REPORT_ORDER.map((status) => status.length),
  );
  const countWidth = Math.max("Count".length, String(report.total).length);

  lines.push(
    `  ${padEnd("Status", statusWidth)}  ${padStart("Count", countWidth)}  ${padStart("Share", 7)}`,
  );
  for (const status of REPORT_ORDER) {
    lines.push(
      `  ${padEnd(status, statusWidth)}  ${padStart(String(report.counts[status]), countWidth)}  ${padStart(share(report.counts[status], report.total), 7)}`,
    );
  }
  lines.push(`  ${"-".repeat(statusWidth + countWidth + 11)}`);
  lines.push(
    `  ${padEnd("total", statusWidth)}  ${padStart(String(report.total), countWidth)}  ${padStart("100.0%", 7)}`,
  );

  if (report.defaulted > 0) {
    lines.push("");
    lines.push(
      `  note: ${report.defaulted} control(s) omit reviewStatus and default to "${DEFAULT_STATUS}".`,
    );
  }

  if (report.byChapter.length > 1) {
    lines.push("");
    lines.push("By chapter:");
    const idWidth = Math.max(...report.byChapter.map((entry) => entry.id.length));
    const totalWidth = Math.max(
      ...report.byChapter.map((entry) => String(entry.total).length),
    );
    for (const entry of report.byChapter) {
      lines.push(
        `  ${padEnd(entry.id, idWidth)}  ${padEnd(entry.title || "(untitled)", 44)}  ` +
          `${padStart(String(entry.total), totalWidth)} controls  ` +
          `${padStart(`${entry.counts.reviewed}/${entry.total}`, 9)} reviewed`,
      );
    }
  }

  if (report.listed.length > 0) {
    lines.push("");
    lines.push(`Controls (${report.listed.length}):`);
    const idWidth = Math.max(
      ...report.listed.map((control) => control.controlId.length),
    );
    for (const control of report.listed) {
      lines.push(
        `  ${padEnd(control.controlId, idWidth)}  ${padEnd(control.chapterId || "?", 4)}  ${control.slug}`,
      );
    }
  }

  return lines.join("\n");
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("## Control review status");
  lines.push("");
  lines.push(
    `Scanned **${report.total}** controls in \`${CONTROLS_LABEL}\` (${report.scope}).`,
  );
  lines.push("");
  lines.push("| Status | Count | Share |");
  lines.push("| --- | ---: | ---: |");
  for (const status of REPORT_ORDER) {
    lines.push(
      `| ${status} | ${report.counts[status]} | ${share(report.counts[status], report.total)} |`,
    );
  }
  lines.push(`| **total** | **${report.total}** | **100.0%** |`);

  if (report.defaulted > 0) {
    lines.push("");
    lines.push(
      `> ${report.defaulted} control(s) omit \`reviewStatus\` and default to \`${DEFAULT_STATUS}\`.`,
    );
  }

  if (report.byChapter.length > 1) {
    lines.push("");
    lines.push("### By chapter");
    lines.push("");
    lines.push("| Chapter | Title | Controls | Reviewed | Share |");
    lines.push("| --- | --- | ---: | ---: | ---: |");
    for (const entry of report.byChapter) {
      lines.push(
        `| ${entry.id} | ${entry.title || "(untitled)"} | ${entry.total} | ` +
          `${entry.counts.reviewed} | ${entry.reviewedShare} |`,
      );
    }
  }

  if (report.listed.length > 0) {
    lines.push("");
    lines.push(`### Controls (${report.listed.length})`);
    lines.push("");
    lines.push("| Control | Chapter | Slug |");
    lines.push("| --- | --- | --- |");
    for (const control of report.listed) {
      lines.push(
        `| ${control.controlId} | ${control.chapterId || "?"} | \`${control.slug}\` |`,
      );
    }
  }

  return lines.join("\n");
}

function renderJson(report) {
  return JSON.stringify(
    {
      contentDir: CONTROLS_LABEL,
      scope: report.scope,
      total: report.total,
      corpusTotal: report.corpusTotal,
      counts: report.counts,
      defaulted: report.defaulted,
      byChapter: report.byChapter,
      controls: report.listed.map((control) => ({
        controlId: control.controlId,
        chapterId: control.chapterId,
        slug: control.slug,
        title: control.title,
        status: control.status,
        declared: control.declared,
      })),
    },
    null,
    2,
  );
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(USAGE);
    return 0;
  }

  const controls = loadControls();
  const report = buildReport(controls, options);

  if (options.format === "json") {
    process.stdout.write(`${renderJson(report)}\n`);
  } else if (options.format === "markdown") {
    process.stdout.write(`${renderMarkdown(report)}\n`);
  } else {
    process.stdout.write(`${renderTable(report)}\n`);
  }

  const violations = REPORT_ORDER.filter(
    (status) => options.failOn.includes(status) && report.counts[status] > 0,
  );
  if (violations.length > 0) {
    const detail = violations
      .map((status) => `${report.counts[status]} ${status}`)
      .join(", ");
    process.stderr.write(`\nReview status check failed: ${detail}.\n`);
    return 1;
  }

  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  if (error instanceof UsageError) {
    process.stderr.write(`${error.message}\n\n${USAGE}`);
  } else {
    process.stderr.write(`${error.message}\n`);
  }
  process.exitCode = 2;
}
