import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, CheckCircle2, Code2, HeartHandshake, LockKeyhole, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { CategoryCard } from "@/components/cards";
import { SearchBox } from "@/components/search-box";
import { Button } from "@/components/ui/button";
import { standard } from "@/config/standard";
import { categories } from "@/content/categories";
import { getAllControls } from "@/lib/content/loader";
import { absoluteUrl, buildOpenGraph } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${standard.name} ${standard.version} Security Training`,
  description:
    `Master secure software development with ${standard.name} ${standard.version} — clear explanations, secure and insecure code examples, and review checklists.`,
  openGraph: buildOpenGraph({
    title: `${standard.academyName} — ${standard.name} ${standard.version} Security Training`,
    description:
      `Master secure software development with ${standard.name} ${standard.version} — clear explanations, secure and insecure code examples, and review checklists.`,
    url: absoluteUrl("/"),
  }),
};

const learningFeatures = [
  {
    icon: BookOpenText,
    title: "Understand the requirement",
    description: `Read concise explanations that connect each ${standard.name} requirement to the engineering decisions it protects.`,
  },
  {
    icon: Code2,
    title: "Compare implementation patterns",
    description: "Study insecure and secure approaches with practical examples across languages and frameworks.",
  },
  {
    icon: SearchCheck,
    title: "Verify what you build",
    description: "Use focused testing notes and review prompts to find gaps before they reach production.",
  },
];

export default function Home() {
  // Count published MDX controls per chapter (server-side, build time).
  const allControls = getAllControls();
  const countByChapter = new Map<string, number>();
  for (const entry of allControls) {
    const chapterId = entry.frontmatter.chapter.id;
    countByChapter.set(chapterId, (countByChapter.get(chapterId) ?? 0) + 1);
  }
  const totalControls = allControls.length;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
              <Sparkles className="h-4 w-4" /> Practical secure software development training
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              Learn to build secure software with {standard.name} {standard.version}.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Master secure development through clear explanations, real code examples, secure and insecure patterns, and focused testing notes you can apply during implementation and review.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/categories/${standard.startCategorySlug}/`}><Button size="lg">Start learning <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/contribute/"><Button size="lg" variant="outline">Contribute <HeartHandshake className="h-4 w-4" /></Button></Link>
            </div>
            <div className="mt-8 max-w-xl"><SearchBox /></div>
          </div>
          <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-glow backdrop-blur">
            <div className="grid gap-4">
              {["Clear explanations for every security concept", "Secure and insecure patterns side by side", "Code examples for practical implementation", "Testing notes for reviews and verification"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border p-5"><ShieldCheck className="h-6 w-6 text-primary" /><p className="mt-3 text-2xl font-bold">{categories.length}</p><p className="text-sm text-muted-foreground">security {standard.groupLabelPlural}</p></div>
              <div className="rounded-2xl border border-border p-5"><LockKeyhole className="h-6 w-6 text-primary" /><p className="mt-3 text-2xl font-bold">{standard.version}</p><p className="text-sm text-muted-foreground">current {standard.name} version</p></div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Learn by doing</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">From security requirement to working implementation</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Build durable security knowledge by moving from the reason behind a control to implementation patterns and verification steps.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {learningFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="border-t border-border pt-6">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Choose a security chapter</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">Follow the official {standard.name} {standard.version} structure — {totalControls} controls across {categories.length} {standard.groupLabelPlural} — and turn each topic into practical secure development skills.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => <CategoryCard key={category.id} category={category} count={countByChapter.get(category.id) ?? 0} />)}
        </div>
      </section>
    </div>
  );
}
