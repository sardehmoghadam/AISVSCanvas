import { Badge } from "@/components/ui/badge";

export function TagFilter({ tags }: { tags: string[] }) {
  return (
    <div aria-label="Tag filters" className="flex flex-wrap gap-2">
      <Badge variant="default">All</Badge>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
