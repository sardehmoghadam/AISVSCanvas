import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search-client";
import { buildSearchIndex } from "@/lib/search";
import { standard } from "@/config/standard";

export const metadata: Metadata = {
  title: "Search",
  description:
    `Search the full OWASP ${standard.name} ${standard.version} catalog across titles, summaries, keywords, tags, and the full text of every control.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function SearchPage() {
  const entries = buildSearchIndex();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Search</h1>
      <p className="mt-3 text-muted-foreground">
        Search the full {standard.name} {standard.version} catalog across titles, summaries, keywords, tags, and
        the full text of every control.
      </p>
      <div className="mt-8">
        <Suspense fallback={<SearchFallback />}>
          <SearchClient entries={entries} />
        </Suspense>
      </div>
    </div>
  );
}

function SearchFallback() {
  return (
    <input
      disabled
      placeholder="Loading search…"
      className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none"
    />
  );
}
