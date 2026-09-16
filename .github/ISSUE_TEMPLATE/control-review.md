---
name: Control review
about: Request or record a human review of a single AISVS control
title: "[Review] C#.#.# - <control title>"
labels: content-review
---

<!--
Use this issue to coordinate a review of one control under content/controls/.
Run `npm run review:status -- --list draft` to find controls that still need one.
-->

## Control

- **Control ID:** <!-- C9.3.2 -->
- **Slug:** <!-- c9-3-2-enforce-tool-sandboxing -->
- **URL:** <!-- /controls/c9-3-2-enforce-tool-sandboxing/ -->
- **Current status:** <!-- draft | reviewed | needs-update -->

## Why this review

<!-- e.g. "Level 2 control with no code examples yet", or "re-check before the 1.0 release". -->

## Review checklist

- [ ] The AISVS requirement is preserved verbatim under `## Main Security Requirement` as a `> Verify that ...` blockquote.
- [ ] `controlId`, `canonicalId`, `chapter.id`, and `section.id` are consistent, and the file name matches the `slug`.
- [ ] `## What This Control Means` matches the intent of the requirement.
- [ ] `## Why This Matters` names the real-world risk, not generic security advice.
- [ ] `## Common Failure Patterns` lists concrete, recognizable mistakes.
- [ ] `## Secure Implementation` enforces the control in deterministic code or configuration, never model judgment alone.
- [ ] Code examples are safe, idiomatic, and labeled with the correct language.
- [ ] References point to authoritative sources (OWASP AISVS, NIST AI RMF, MITRE ATLAS).
- [ ] `## Checklist for Code Review` asks questions a reviewer can actually verify.
- [ ] No secrets, tokens, or unsafe defaults appear in the content.

## Notes and findings

<!-- Anything the checklist turned up: gaps, dubious claims, missing evidence. -->

## Reviewer sign-off

- **Reviewer:** <!-- GitHub handle -->
- **Date:** <!-- YYYY-MM-DD -->
- **Outcome:** <!-- reviewed | needs-update -->
