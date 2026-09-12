"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

/** Search entry point for the header and hero: submits to the full search page. */
export function SearchBox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/search/?q=${encodeURIComponent(query)}` : "/search/");
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative block">
      <label htmlFor={inputId} className="sr-only">
        Search controls
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search controls, tags, references..."
        className={`w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring ${compact ? "h-10 pr-20" : "h-12 pr-20"}`}
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-2 my-auto flex h-8 items-center rounded-full px-3 text-xs font-medium text-primary transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        Search
      </button>
    </form>
  );
}
