# Pull Request

<!--
Thanks for contributing to AISVS Academy! Keep the description short and
specific, and delete any section that does not apply.
-->

## What changed

<!-- e.g. "Adds control C9.3.2 for agent tool sandboxing." -->

- Closes #

## Type of change

- [ ] New control (MDX)
- [ ] Enrichment of an existing `draft` control
- [ ] Correction to already reviewed content
- [ ] Site, build, or tooling change (no content review needed)

## Content checklist

Required for edits under `content/controls/`. See `CONTRIBUTING.md` for detail.

- [ ] Frontmatter validates - `npm run build` fails the build on schema errors.
- [ ] `controlId`, `canonicalId`, `chapter.id`, and `section.id` are consistent (the schema derives and enforces them).
- [ ] The file name matches the `slug`.
- [ ] All seven `##` sections are present.
- [ ] The AISVS requirement is preserved verbatim under `## Main Security Requirement` as a `> Verify that ...` blockquote.
- [ ] Code examples are safe, idiomatic, and labeled with the correct language.
- [ ] References point to authoritative sources (OWASP AISVS, NIST AI RMF, MITRE ATLAS).
- [ ] `relatedControls` point at real controls and their titles match.
- [ ] No secrets, tokens, or unsafe defaults are introduced.

## Validation

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run review:status`

## Review status

New and unverified content stays `reviewStatus: draft`. Complete this section
only when promoting a control to `reviewed` or marking it `needs-update`:

- Control(s): <!-- C9.3.2 -->
- New status: <!-- reviewed | needs-update -->
- Reviewer: <!-- GitHub handle of the human who performed the review -->
- Review date: <!-- YYYY-MM-DD -->
- Notes: <!-- anything a future reader should know about this review -->
