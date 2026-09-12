import Link from "next/link";
import { standard } from "@/config/standard";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-muted/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-semibold text-foreground">{standard.academyName}</p>
          <p className="mt-2 max-w-sm leading-6">Practical training for developers and reviewers who want to understand, implement, and verify secure software.</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Learn</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link className="transition hover:text-foreground" href={`/categories/${standard.startCategorySlug}/`}>{standard.name} {standard.version} {standard.groupLabelPlural}</Link>
            <Link className="transition hover:text-foreground" href="/controls/c2-1-3-screen-model-steering-inputs-for-prompt-injection/">Example Lesson</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground">Training approach</p>
          <p className="mt-3 leading-6">Learn with explanations, implementation patterns, code examples, testing notes, references, and related controls.</p>
        </div>
      </div>
    </footer>
  );
}
