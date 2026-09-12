import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export type RelatedControl = {
  slug: string;
  title: string;
  summary: string;
};

export function RelatedControls({ controls }: { controls: RelatedControl[] }) {
  if (controls.length === 0) {
    return <p className="text-sm text-muted-foreground">No related controls yet.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {controls.map((control) => (
        <Link key={control.slug} href={`/controls/${control.slug}/`} className="group block h-full">
          <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{control.title}</CardTitle>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{control.summary}</CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
