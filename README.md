# AISVS Academy

Static-first OWASP AISVS training portal built with Next.js, TypeScript, Tailwind CSS, and reusable content-driven components. It turns the Artificial Intelligence Security Verification Standard (AISVS 1.0) into practical, reviewable training for every one of its 191 requirements.

## Architecture
- `app/` contains the static export pages, layouts, and route-level UI.
- `components/` contains reusable presentation components and accessible building blocks.
- `content/` contains structured training data separate from presentation.
- `config/standard.ts` is the single source of truth for standard identity, id shapes, hierarchy, and levels.
- `types/` defines the content schema for AI-assisted control generation.
- The project uses Next.js static export so it can be deployed to GitHub Pages or any static host.

## Content Model
Each requirement is a single MDX file in `content/controls/` with YAML frontmatter for structured
metadata (see `lib/content/schema.ts`) and a Markdown body for the educational narrative and
AI-specific verification guidance.

The AISVS content (12 chapters, 44 sections, 191 requirements) is generated programmatically from
`scripts/generate-aisvs-content.mjs`, which holds the parsed standard plus per-chapter enrichment.
Re-run it with `node scripts/generate-aisvs-content.mjs` to regenerate `content/categories.ts`,
`content/sections.ts`, and every control MDX file. Regeneration preserves each control's
`reviewStatus`, so marking a control `reviewed` is not undone by re-running the script; pass
`--reset-review` to deliberately reset every control back to `draft`.

## Adding a New Control
1. Create `content/controls/<slug>.mdx` with valid frontmatter (control ID, chapter, section, tags, references).
2. Write the body using the seven-section template (What This Control Means, Why This Matters,
   Main Security Requirement, Common Failure Patterns, Secure Implementation, Key Rules,
   Checklist for Code Review).
3. Run `npm run build` to validate frontmatter against the schema and generate the page.

See `CONTRIBUTING.md` or the in-app Contribute page (`/contribute/`) for the full guide.

## Review Status
Every control carries a `reviewStatus` in its frontmatter — `draft`, `reviewed`, or `needs-update`
(see `lib/content/schema.ts`). New and AI-generated content stays `draft` until a human works
through the review checklist.

Report current coverage from the repo root:

```bash
npm run review:status                             # draft vs reviewed summary, per chapter
npm run review:status -- --list draft             # the un-reviewed worklist
npm run review:status -- --chapter C9             # scope to a single chapter
npm run review:status -- --format markdown        # a table to paste into an issue
npm run review:status -- --fail-on needs-update   # non-zero exit when a control needs re-review
```

Contributors use `.github/PULL_REQUEST_TEMPLATE.md` (the per-PR checklist) and
`.github/ISSUE_TEMPLATE/control-review.md` (to claim a single control to review); the full
workflow is documented in `CONTRIBUTING.md`.

## Deployment
- Run `npm run build` to generate the static export.
- Deploy the generated output to GitHub Pages or any static file host.

Pushes to `main` deploy automatically through `.github/workflows/deploy.yml`, which runs
`npm run verify` (tests, lint, and the `needs-update` review gate) in the build job before
`next build`. The deploy job depends on the build job, so a failing check blocks the deployment
instead of shipping a broken or stale control to production.

## SEO
- Per-page metadata (title, description, Open Graph/Twitter, canonical) is generated from `lib/site-config.ts`.
- `app/robots.ts` and `app/sitemap.ts` emit `robots.txt` and `sitemap.xml` on the static export.
- Icons are served from `app/icon.svg`, `app/icon.png` (512px), and `app/apple-icon.png` (180px).
  Regenerate the raster icons with `node scripts/generate-icons.mjs`.
- Structured data (JSON-LD): site-wide `WebSite`/`Organization` (root layout), `BreadcrumbList`
  (category/section/control pages), and `TechArticle` + `LearningResource` per control.
- Search Console: add your Google verification token as a repository variable named
  `GOOGLE_SITE_VERIFICATION` (Settings > Secrets and variables > Actions > Variables), then
  redeploy. CI injects it into the `google-site-verification` meta tag. Afterwards submit
  `https://sardehmoghadam.github.io/AISVSCanvas/sitemap.xml` in Search Console.
- Analytics: add your GA4 Measurement ID (`G-XXXXXXXXXX`) as a repository variable named
  `GA_MEASUREMENT_ID` (Settings > Secrets and variables > Actions > Variables), then redeploy.
  CI injects it into the gtag.js loader in `components/analytics.tsx`; when the variable is
  absent no analytics script is emitted.

## Notes
- Search is powered by a build-time static index (`lib/search.ts`) covering every control's id, title, summary, chapter, section, tags, references, and related controls.
- The design system is intentionally small and reusable so content can scale without redesigning page templates.
