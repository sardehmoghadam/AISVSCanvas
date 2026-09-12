import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DocsLayout } from "@/components/docs-layout";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { standard } from "@/config/standard";
import { categories } from "@/content/categories";
import { sections, getSectionBySlug } from "@/content/sections";
import { getControlsBySection } from "@/lib/content/loader";
import { absoluteUrl, SITE_URL, buildOpenGraph } from "@/lib/site-config";
import { breadcrumbListJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return sections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section) return {};

  const title = `${section.id} ${section.title}`;
  const url = `${SITE_URL}/sections/${section.slug}/`;

  return {
    title,
    description: section.description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({
      title,
      description: section.description,
      url,
    }),
  };
}

/** Card-safe adapter used by the render loop. */
type SectionControlCard = {
  controlId: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: string;
  reviewStatus: string;
  tags: string[];
};

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // ── Resolve section and its parent chapter ──────────────────────────────
  const section = getSectionBySlug(slug);
  if (!section) notFound();

  const chapter = categories.find((cat) => cat.id === section.chapterId);
  if (!chapter) notFound();

  const breadcrumbs = breadcrumbListJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: `${chapter.id} ${chapter.title}`, url: absoluteUrl(`/categories/${chapter.slug}/`) },
    { name: `${section.id} ${section.title}`, url: absoluteUrl(`/sections/${section.slug}/`) },
  ]);

  // ── Collect controls that belong to this section ───────────────────────
  const cards: SectionControlCard[] = getControlsBySection(section.id).map(
    (entry) => ({
      controlId: entry.frontmatter.controlId,
      slug: entry.frontmatter.slug,
      title: entry.frontmatter.title,
      summary: entry.frontmatter.summary,
      difficulty: entry.frontmatter.difficulty,
      reviewStatus: entry.frontmatter.reviewStatus,
      tags: entry.frontmatter.tags,
    }),
  );
  return (
    <DocsLayout>
      <JsonLd data={breadcrumbs} />
      <main className="px-4 py-10 sm:px-6 lg:px-0 lg:py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            {
              label: `${chapter.id} ${chapter.title}`,
              href: `/categories/${chapter.slug}/`,
            },
            { label: `${section.id} ${section.title}` },
          ]}
        />

        <header className="mt-8 border-b border-border/70 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{section.id}</Badge>
            <Badge variant="outline">{standard.name} {standard.version}</Badge>
            <Badge variant="secondary">{chapter.id}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {section.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            {section.description}
          </p>
        </header>

        <section className="mt-10" aria-labelledby="section-controls">
          <h2 id="section-controls" className="text-2xl font-semibold tracking-tight">
            Controls in this section
          </h2>

          {cards.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {cards.map((card) => (
                <Link
                  key={card.slug}
                  href={`/controls/${card.slug}/`}
                  className="group block h-full"
                >
                  <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{card.controlId}</Badge>
                        <Badge variant="outline">{card.difficulty}</Badge>
                        <Badge variant="secondary">{card.reviewStatus}</Badge>
                      </div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription>{card.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-6">
              <p className="font-medium">
                No controls have been published for {section.id} {section.title} yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This section is part of the {chapter.id} {chapter.title} {standard.groupLabel}.
                Individual requirements will appear here as authoring progresses.
              </p>
            </div>
          )}
        </section>
      </main>
    </DocsLayout>
  );
}