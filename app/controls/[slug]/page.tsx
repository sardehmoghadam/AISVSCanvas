import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DocsLayout } from "@/components/docs-layout";
import { JsonLd } from "@/components/json-ld";
import { ReferencesList } from "@/components/references-list";
import { RelatedControls } from "@/components/related-controls";
import { TableOfContents } from "@/components/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { standard } from "@/config/standard";
import { categories } from "@/content/categories";
import {
  getAllControls,
  getControlBySlug as getMdxControl,
  compileControl,
  type ControlEntry,
} from "@/lib/content/loader";
import { extractHeadings } from "@/lib/content/headings";
import { absoluteUrl, SITE_URL, buildOpenGraph } from "@/lib/site-config";
import { breadcrumbListJsonLd, controlJsonLd } from "@/lib/structured-data";

export function generateStaticParams() {
  return getAllControls().map((entry) => ({ slug: entry.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const mdxEntry = getMdxControl(slug);
  if (mdxEntry) {
    const { frontmatter } = mdxEntry;
    const url = `${SITE_URL}/controls/${slug}/`;
    return {
      title: frontmatter.title,
      description: `OWASP ${standard.name} ${frontmatter.standardVersion} control ${frontmatter.controlId}: ${frontmatter.summary}`,
      alternates: { canonical: url },
      openGraph: buildOpenGraph({
        title: frontmatter.title,
        description: frontmatter.summary,
        url,
      }),
    };
  }

  return {};
}

/**
 * Renders an MDX-authored control page.
 */
async function renderMdxControl(entry: ControlEntry) {
  const compiled = await compileControl(entry);
  const { frontmatter } = compiled;
  const category = categories.find((c) => c.id === frontmatter.chapter.id);
  const allControls = getAllControls();
  const related = allControls
    .filter((e) => e.frontmatter.chapter.id === frontmatter.chapter.id && e.frontmatter.slug !== frontmatter.slug)
    .slice(0, 2);
  const headings = extractHeadings(entry.body);

  const controlUrl = absoluteUrl(`/controls/${frontmatter.slug}/`);
  const groupTitle = category?.title ?? frontmatter.chapter.title;
  const breadcrumbs = breadcrumbListJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    ...(category
      ? [{ name: groupTitle, url: absoluteUrl(`/categories/${category.slug}/`) }]
      : []),
    { name: frontmatter.controlId, url: controlUrl },
  ]);
  const structuredData = controlJsonLd({
    url: controlUrl,
    title: frontmatter.title,
    summary: frontmatter.summary,
    controlId: frontmatter.controlId,
    standardVersion: frontmatter.standardVersion,
    levels: frontmatter.levels,
    tags: frontmatter.tags,
    groupTitle,
  });

  return (
    <DocsLayout>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={structuredData} />
      <div className="grid gap-8 px-4 py-10 sm:px-6 lg:px-0 xl:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0 max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              {
                label: category?.title ?? frontmatter.chapter.title,
                href: category ? `/categories/${category.slug}/` : undefined,
              },
              { label: frontmatter.controlId },
            ]}
          />
          <header className="mt-8 border-b border-border/70 pb-8">
            <div className="flex flex-wrap gap-2">
              <Badge>{frontmatter.controlId}</Badge>
              <Badge variant="outline">{standard.name} {standard.version}</Badge>
              <Badge variant="secondary">{frontmatter.difficulty}</Badge>
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance">{frontmatter.title}</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{frontmatter.summary}</p>
          </header>

          <div className="mt-10 prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-code:before:content-none prose-code:after:content-none">
            {compiled.content}
          </div>

          {frontmatter.references.length > 0 ? (
            <section id="references" className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">References</h2>
              <ReferencesList references={frontmatter.references} />
            </section>
          ) : null}

          {related.length > 0 ? (
            <section id="related-controls" className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Related Controls</h2>
              <RelatedControls controls={related.map((e) => ({
                slug: e.frontmatter.slug,
                title: e.frontmatter.title,
                summary: e.frontmatter.summary,
              }))} />
            </section>
          ) : null}
        </article>
        <TableOfContents items={headings} />
      </div>
    </DocsLayout>
  );
}

export default async function ControlPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const mdxEntry = getMdxControl(slug);
  if (!mdxEntry) {
    notFound();
  }

  return renderMdxControl(mdxEntry);
}