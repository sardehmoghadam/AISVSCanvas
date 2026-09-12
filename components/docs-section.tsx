import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DocsSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DocsSection({ id, eyebrow, title, description, children, className }: DocsSectionProps) {
  const titleId = id ? `${id}-title` : undefined;

  return (
    <section id={id} aria-labelledby={titleId} className={cn("scroll-mt-24 space-y-4", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
        <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? <p className="max-w-3xl text-base leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
