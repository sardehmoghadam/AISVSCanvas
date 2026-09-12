import { ExternalLink } from "lucide-react";

export function ReferencesList({ references }: { references: { label: string; url: string }[] }) {
  return (
    <ul className="space-y-3">
      {references.map((reference) => (
        <li key={reference.url}>
          <a
            href={reference.url}
            className="inline-flex items-center gap-2 rounded-md text-primary underline-offset-4 transition hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            target="_blank"
            rel="noreferrer"
          >
            <span>{reference.label}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
