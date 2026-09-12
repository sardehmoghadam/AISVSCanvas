import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { standard } from "@/config/standard";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionCard } from "@/components/cards";
import { DocsLayout } from "@/components/docs-layout";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { categories, getCategoryBySlug } from "@/content/categories";
import { getSectionsByChapter } from "@/content/sections";
import { getControlsByChapter, getControlsBySection } from "@/lib/content/loader";
import { absoluteUrl, SITE_URL, buildOpenGraph } from "@/lib/site-config";
import { breadcrumbListJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category.id} ${category.title}`;
  const url = `${SITE_URL}/categories/${category.slug}/`;

  return {
    title,
    description: category.description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({
      title,
      description: category.description,
      url,
    }),
  };
}

function levelLabel(id: string): string {
  return standard.levels.find((level) => level.id === id)?.label ?? id;
}

function ChapterSections({ category }: { category: (typeof categories)[number] }) {
  const chapterSections = getSectionsByChapter(category.id);
  const sectionsWithCounts = chapterSections.map((section) => ({
    section,
    count: getControlsBySection(section.id).length,
  }));
  const totalControls = sectionsWithCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <section className="mt-10" aria-labelledby="chapter-sections">
      <h2 id="chapter-sections" className="text-2xl font-semibold tracking-tight">
        {standard.sectionLabelPlural} ({totalControls} controls)
      </h2>
      {chapterSections.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sectionsWithCounts.map(({ section, count }) => (
            <SectionCard key={section.id} section={section} count={count} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-6">
          <p className="font-medium">
            No {standard.sectionLabelPlural} have been defined for {category.id} {category.title} yet.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This {standard.groupLabel} is part of the official {standard.name} {standard.version} structure.{" "}
            {standard.sectionLabelPlural} and training material will be added as authoring progresses.
          </p>
        </div>
      )}
    </section>
  );
}

function ChapterControls({ category }: { category: (typeof categories)[number] }) {
  const controls = getControlsByChapter(category.id);

  return (
    <section className="mt-10" aria-labelledby="chapter-controls">
      <h2 id="chapter-controls" className="text-2xl font-semibold tracking-tight">
        Controls ({controls.length})
      </h2>
      {controls.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {controls.map((entry) => {
            const fm = entry.frontmatter;
            return (
              <Link key={fm.slug} href={`/controls/${fm.slug}/`} className="group block h-full">
                <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{fm.controlId}</Badge>
                      <Badge variant="outline">{fm.difficulty}</Badge>
                      <Badge variant="secondary">{fm.reviewStatus}</Badge>
                    </div>
                    <CardTitle className="text-lg">{fm.title}</CardTitle>
                    <CardDescription>{fm.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {fm.levels.map((level) => (
                      <Badge key={level} variant="outline">
                        {levelLabel(level)}
                      </Badge>
                    ))}
                    {fm.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-6">
          <p className="font-medium">No controls have been published for {category.id} yet.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Individual requirements will appear here as authoring progresses.
          </p>
        </div>
      )}
    </section>
  );
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const breadcrumbs = breadcrumbListJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: `${category.id} ${category.title}`, url: absoluteUrl(`/categories/${category.slug}/`) },
  ]);

  return (
    <DocsLayout>
      <JsonLd data={breadcrumbs} />
      <main className="px-4 py-10 sm:px-6 lg:px-0 lg:py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: `${category.id} ${category.title}` },
          ]}
        />

        <header className="mt-8 border-b border-border/70 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{category.id}</Badge>
            <Badge variant="outline">{standard.name} {standard.version}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">{category.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{category.description}</p>
        </header>

        {standard.hasSections ? (
          <ChapterSections category={category} />
        ) : (
          <ChapterControls category={category} />
        )}
      </main>
    </DocsLayout>
  );
}