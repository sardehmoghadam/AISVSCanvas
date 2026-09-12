import { slugifyHeading } from "@/lib/content/headings";

export function TableOfContents({ items }: { items: string[] }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 text-sm shadow-sm">
        <p className="font-semibold">On this page</p>
        <nav aria-label="On this page" className="mt-3 flex flex-col gap-2 text-muted-foreground">
          {items.map((item) => (
            <a key={item} href={`#${slugifyHeading(item)}`} className="rounded-md px-1 py-0.5 transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              {item}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
