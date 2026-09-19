# Contributing to AISVS Academy

## Goal
Create practical, reviewable AISVS training controls that are easy to extend with AI-generated drafts and human review.

## Where Content Lives
- Controls: `content/controls/*.mdx` (one file per requirement, frontmatter + Markdown body)
- Chapters: `content/categories.ts`
- Sections: `content/sections.ts`
- Frontmatter schema: `lib/content/schema.ts` (Zod, validated at build time)
- Loader: `lib/content/loader.ts`
- Generator: `scripts/generate-aisvs-content.mjs` (regenerates all content)

## Control Authoring Rules
- Keep content separate from page components — content is Markdown, never JSX page code.
- Use concise, practical language for engineering teams.
- Preserve the AISVS requirement text verbatim under `## Main Security Requirement` (as a blockquote beginning `> Verify that`).
- Include AI-specific verification guidance: what to enforce, where, and what evidence an auditor should collect.
- Mark new or unverified content as `reviewStatus: "draft"` until reviewed.
- Prefer official OWASP AISVS, NIST AI RMF, and MITRE ATLAS references.
- Use stable kebab-case slugs such as `c2-1-3-screen-model-steering-inputs-for-prompt-injection`.

## Expected Frontmatter
Use `ControlFrontmatterSchema` in `lib/content/schema.ts`. Every control should include:

- `schemaVersion` (default `"1.0.0"`)
- `standardVersion` (defaults to the configured standard version, `"1.0"`)
- `controlId` (e.g. `C2.1.3`)
- `canonicalId` (optional, e.g. `v1.0-C2.1.3`)
- `slug` (kebab-case)
- `title`
- `summary`
- `chapter` (`id: C2`, `title`)
- `section` (`id: C2.1`, `title`)
- `levels` (array of level ids, e.g. `["1"]`)
- `tags`
- `difficulty` (`foundational` | `intermediate` | `advanced`)
- `reviewStatus` (`draft` | `reviewed` | `needs-update`)
- `references` (`{ label, url }[]`)
- `relatedControls` (`{ id, title, href }[]`)

Note: `chapter.id` and `section.id` are derived from `controlId`, so they must match exactly or the build will fail.

## Body Template
Each control body uses seven `##` sections:

1. `## What This Control Means`
2. `## Why This Matters`
3. `## Main Security Requirement` (verbatim AISVS requirement as a blockquote)
4. `## Common Failure Patterns`
5. `## Secure Implementation`
6. `## Key Rules`
7. `## Checklist for Code Review`

Headings receive automatic IDs so they appear in the right-hand “On this page” sidebar.

## Reusable MDX Components
- `<Callout kind="note|warning|secure|insecure" title="...">…</Callout>` for highlighted guidance.
- Regular fenced code blocks, GFM tables, and lists work out of the box.
- References and related controls live in the frontmatter and render automatically.

## Review Checklist
- Control ID, chapter, section, and canonicalId are correct and consistent.
- The `Verify that` requirement text is preserved verbatim.
- AI-specific guidance and code examples are safe and idiomatic.
- References are valid and relevant.
- No secrets or unsafe defaults are introduced.
- Build passes with `npm run build`.

The same checklist is mirrored in `.github/PULL_REQUEST_TEMPLATE.md`, which also runs
`npm test` and `npm run review:status`.

## Review Workflow
Content ships as `reviewStatus: draft` and is promoted only after a human review.

1. Find work with `npm run review:status -- --list draft` (add `--chapter C2` to scope it).
2. Claim a control with the `.github/ISSUE_TEMPLATE/control-review.md` issue template.
3. Work through the checklist above for that single control.
4. Open a PR that sets `reviewStatus: reviewed` and records the reviewer, date, and any
   caveats in the "Review status" section of the PR template.
5. Mark a control `needs-update` when new guidance invalidates its content. CI fails on
   `needs-update`, so a stale control cannot ship unnoticed.

Statuses are defined by `ReviewStatusSchema` in `lib/content/schema.ts`.

## Commands
- `npm run dev` — local preview
- `npm run build` — static export plus schema/type/MDX validation (fails on invalid content)
- `npm test` — content-integrity tests (frontmatter schema, unique slugs, required sections, related links)
- `npm run lint` — lint check
- `npm run review:status` — draft vs reviewed coverage report (`--list`, `--chapter`, `--format`, `--fail-on`)
- `node scripts/generate-aisvs-content.mjs` — regenerate categories, sections, and controls.
  Existing review state is carried over, so this never discards `reviewed` or `needs-update`
  markers; add `--reset-review` to deliberately stamp every control back to `draft`.

