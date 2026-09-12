import Link from "next/link";
import { categories } from "@/content/categories";
import { standard } from "@/config/standard";
import { cn } from "@/lib/utils";

const linkStyles = cn(
  "rounded-xl px-3 py-2 leading-6 text-muted-foreground transition",
  "hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

function ChapterLinks() {
  return (
    <nav className="mt-3 flex flex-col gap-1 text-sm" aria-label={`${standard.name} ${standard.version} ${standard.groupLabelPlural}`}>
      {categories.map((category) => (
        <Link key={category.id} className={linkStyles} href={`/categories/${category.slug}/`}>
          <span className="font-medium text-foreground/80">{category.id}</span> {category.title}
        </Link>
      ))}
    </nav>
  );
}

export function DocsSidebar() {
  return (
    <aside className="border-b border-border/70 bg-muted/10 px-4 py-4 lg:border-b-0 lg:border-r lg:py-6">
      <div className="lg:sticky lg:top-24 lg:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{standard.name} {standard.groupLabelPlural}</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{standard.version}</span>
        </div>

        <details className="mt-3 lg:hidden">
          <summary className="cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Browse {standard.name} {standard.version} {standard.groupLabelPlural}
          </summary>
          <ChapterLinks />
        </details>

        <div className="hidden lg:block">
          <ChapterLinks />
        </div>

      </div>
    </aside>
  );
}
