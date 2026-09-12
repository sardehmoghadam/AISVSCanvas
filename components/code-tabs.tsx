import { Badge } from "@/components/ui/badge";

import { Card } from "@/components/ui/card";
import type { CodeExample } from "@/types/content";

function CodeHeader({ example }: { example: CodeExample }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{example.label}</p>
        <p className="text-xs text-muted-foreground">{example.filename ?? "Example code"}</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Badge variant={example.secure ? "default" : "outline"}>{example.secure ? "Secure" : "Review"}</Badge>
        <Badge variant="outline">{example.language}</Badge>
      </div>
    </div>
  );
}

export function CodeTabs({ examples }: { examples: CodeExample[] }) {
  if (examples.length === 0) {
    return null;
  }

  return (


    <div className="space-y-4">
      <nav aria-label="Code examples" className="flex flex-wrap gap-2">
        {examples.map((example) => (

          <a
            key={example.language}
            href={`#code-${example.language}`}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {example.label}

          </a>
        ))}


      </nav>
      <div className="space-y-4">
        {examples.map((example) => (






          <Card key={`${example.language}-${example.filename ?? "code"}`} id={`code-${example.language}`} className="overflow-hidden scroll-mt-24">
            <CodeHeader example={example} />
            <div className="bg-slate-950 p-4 text-sm text-slate-100 dark:bg-slate-900 sm:p-5">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words leading-6">
                <code>{example.code}</code>
              </pre>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
