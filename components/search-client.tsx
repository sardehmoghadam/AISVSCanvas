"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SearchEntry } from "@/lib/search";
import { standard } from "@/config/standard";

function filterEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  // Every term must match somewhere in the haystack (AND semantics).
  return entries.filter((entry) =>
    tokens.every((token) => entry.searchText.includes(token)),
  );
}

export function SearchClient({ entries }: { entries: SearchEntry[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(q);

  // Keep in sync when the URL changes (e.g. submitting from the header box).
  useEffect(() => {
    setQuery(q);
  }, [q]);

  const trimmed = query.trim();
  const results = useMemo(() => filterEntries(entries, query), [entries, query]);

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative block">
        <label htmlFor="search-input" className="sr-only">
          Search controls
        </label>
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the full text of every control..."
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 pr-16 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        {trimmed.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-2 my-auto flex h-8 items-center rounded-full px-3 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            Clear
          </button>
        )}
      </form>

      {trimmed.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 font-medium">Search {entries.length} {standard.name} {standard.version} controls.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Match on titles, summaries, keywords, tags, {standard.groupLabelPlural}, {standard.sectionLabelPlural}, and
            the full body text. Try a keyword like{" "}
            <span className="text-foreground">output-encoding</span> or a {standard.groupLabel} like{" "}
            <span className="text-foreground">{standard.examples.groupId}</span>.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/20 p-6">
          <p className="font-medium">No controls match &ldquo;{trimmed}&rdquo;.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Try a shorter query, or search by {standard.groupLabel} id ({standard.examples.groupId}),
            {standard.sectionLabel} id ({standard.examples.sectionId}), difficulty (foundational / intermediate /
            advanced), or a tag.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{trimmed}&rdquo;
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {results.map((entry) => (
              <Link key={entry.controlId} href={entry.href} className="group block h-full">
                <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{entry.controlId}</Badge>
                      <Badge variant="outline">{entry.difficulty}</Badge>
                      <Badge variant="secondary">{entry.reviewStatus}</Badge>
                    </div>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <CardDescription>{entry.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {entry.chapterId} {entry.chapterTitle}
                      {entry.sectionId ? <> &middot; {entry.sectionId} {entry.sectionTitle}</> : null}{" "}
                      &middot; {entry.levels.join(" · ")}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
