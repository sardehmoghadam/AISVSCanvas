import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileCode2,
  GitBranch,
  GitPullRequest,
  HeartHandshake,
  ListChecks,
  SearchCheck,
  Terminal,
  Wand2,
} from "lucide-react";
import { Callout } from "@/components/callout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { standard } from "@/config/standard";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    `Help grow ${standard.academyName} — author new controls, enrich stub requirements, and review submissions in this open-source OWASP ${standard.name} training portal.`,
};

const contributionTypes = [
  {
    icon: FileCode2,
    title: "Write a new control",
    description:
      `Turn a ${standard.name} requirement into a new .mdx file using the seven-section template.`,
  },
  {
    icon: Wand2,
    title: "Enrich a stub control",
    description:
      "Fill in explanation, failure patterns, secure guidance, and code for existing draft controls.",
  },
  {
    icon: SearchCheck,
    title: "Improve existing content",
    description:
      "Tighten wording, add idiomatic code examples, or fix references on any published control.",
  },
  {
    icon: HeartHandshake,
    title: "Fix the site",
    description:
      "Report bugs, refine components, or improve the documentation and build tooling.",
  },
];

const workflowSteps = [
  {
    icon: GitBranch,
    title: "Fork and branch",
    description:
      "Fork the repository and create a short-lived branch such as control/c2-1-3.",
  },
  {
    icon: ListChecks,
    title: "Pick a requirement",
    description:
      `Choose an ${standard.name} control ID and check content/controls/ to avoid duplicating an existing slug.`,
  },
  {
    icon: Code2,
    title: "Author the file",
    description:
      "Create content/controls/<slug>.mdx with valid frontmatter and the seven-section body below.",
  },
  {
    icon: Terminal,
    title: "Validate",
    description:
      "Run npm run build. Schema errors, type errors, and broken pages fail the build.",
  },
  {
    icon: GitPullRequest,
    title: "Open a pull request",
    description:
      "Commit with reviewStatus: draft and describe what you added and why.",
  },
];

const bodyTemplate = [
  { heading: "What This Control Means", note: "A short definition of the control and when it applies." },
  { heading: "Why This Matters", note: "The real-world risk the control prevents." },
  { heading: "Main Security Requirement", note: `The verbatim ${standard.name} requirement as a blockquote.` },
  { heading: "Common Failure Patterns", note: "Concrete mistakes that introduce the vulnerability." },
  { heading: "Secure Implementation", note: "Idiomatic code across languages showing the fix." },
  { heading: "Key Rules", note: "Durable rules an engineer can apply without memorizing the examples." },
  { heading: "Checklist for Code Review", note: "Questions to verify the control is correctly implemented." },
];

const reviewChecklist = [
  "Control ID, chapter.id, section.id, and canonicalId are consistent (the schema enforces this).",
  `The ${standard.name} requirement text is preserved verbatim under Main Security Requirement.`,
  "Code examples are safe, idiomatic, and labeled with the correct language.",
  "References point to official OWASP or authoritative framework documentation.",
  "npm run build completes without errors.",
];

const frontmatterSample = `---
schemaVersion: "1.0.0"
standardVersion: "1.0"
controlId: C2.1.3
canonicalId: v1.0-C2.1.3
slug: c2-1-3-screen-model-steering-inputs-for-prompt-injection
title: Screen model-steering inputs for prompt injection
summary: Treat every model-steering input as untrusted and block flagged inputs.
chapter:
  id: C2
  title: Input Validation
section:
  id: C2.1
  title: Prompt Injection Defenses
levels: ["1"]
tags:
  - prompt-injection
  - input-validation
  - untrusted-input
keywords:
  - prompt injection
  - model steering
difficulty: foundational
reviewStatus: draft
references:
  - label: OWASP AISVS 1.0
    url: https://github.com/OWASP/AISVS
relatedControls:
  - id: C2.1.2
    title: Detect encoding and representation smuggling
    href: /controls/c2-1-2-detect-encoding-and-representation-smuggling/
---`;;

const calloutExample = `<Callout kind="secure" title="Secure practice">
  Treat every model-steering input as untrusted and screen it before
  it reaches the model context.
</Callout>`;

export default function ContributePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
        <BadgeCheck className="h-4 w-4" /> Open source training content
      </div>
      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
        Contribute to {standard.academyName}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
        {standard.academyName} turns the OWASP {standard.fullName} into practical,
        reviewable training. Every control is a single Markdown (MDX) file, so contributing is as
        simple as editing text — no framework knowledge required.
      </p>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Ways to contribute</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {contributionTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card/60 p-6 transition hover:border-primary/30"
              >
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Contribution workflow</h2>
        <ol className="mt-6 space-y-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                    {index + 1}
                  </span>
                  {index < workflowSteps.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  ) : null}
                </div>
                <div className="pb-2">
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <Icon className="h-4 w-4 text-primary" /> {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Authoring a control</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Controls live in <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">content/controls/*.mdx</code>.
          Each file has two parts: <strong>frontmatter</strong> (structured YAML metadata validated by a Zod
          schema) and a <strong>body</strong> (the educational narrative and code in Markdown).
        </p>

        <h3 className="mt-8 text-lg font-semibold">Frontmatter</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Required: <code>controlId</code> (V#.#.#), <code>slug</code> (kebab-case), <code>title</code>,{" "}
          <code>summary</code>, <code>chapter</code> (<code>id: V#</code>, <code>title</code>), and{" "}
          <code>section</code> (<code>id: V#.#</code>, <code>title</code>). Optional or defaulted:{" "}
          <code>canonicalId</code>, <code>levels</code> (1–3), <code>tags</code>, <code>difficulty</code>{" "}
          (foundational | intermediate | advanced), <code>reviewStatus</code> (draft | reviewed | needs-update),{" "}
          <code>references</code>, and <code>relatedControls</code>. The chapter and section IDs are derived from the
          control ID, so any mismatch fails the build.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code>{frontmatterSample}</code>
        </pre>

        <h3 className="mt-8 text-lg font-semibold">Body template</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Follow these seven sections. Headings automatically receive IDs and appear in the “On this page” sidebar.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-6">
          {bodyTemplate.map((section) => (
            <li key={section.heading}>
              <code className="font-semibold text-foreground">## {section.heading}</code>
              <span className="text-muted-foreground"> — {section.note}</span>
            </li>
          ))}
        </ol>

        <h3 className="mt-8 text-lg font-semibold">Reusable components</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use <code>Callout</code> for highlighted guidance, regular fenced code blocks for examples (GFM tables,
          links, and lists work too), and put references and related controls in the frontmatter so they render
          automatically at the bottom of the page.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code>{calloutExample}</code>
        </pre>
        <div className="mt-4">
          <Callout kind="note" title="Callout kinds">
            Available variants: <Badge variant="outline">note</Badge> <Badge variant="outline">warning</Badge>{" "}
            <Badge variant="outline">secure</Badge> <Badge variant="outline">insecure</Badge>. Each shows a colored
            panel with a title and body text.
          </Callout>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Review checklist</h2>
        <ul className="mt-6 space-y-3">
          {reviewChecklist.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm leading-6 text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 flex flex-col gap-4 rounded-3xl border border-border bg-muted/40 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ready to get started?</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Browse the catalog to see the current {standard.name} {standard.version} coverage and pick a control to work on.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/categories/${standard.startCategorySlug}/`}>
            <Button size="lg">Browse the catalog</Button>
          </Link>
          <a
            href={standard.standardUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="outline">
              {standard.name} {standard.version} <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
