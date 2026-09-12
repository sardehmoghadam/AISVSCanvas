import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium leading-none transition-colors",
        variant === "default" && "bg-primary/10 text-primary ring-1 ring-primary/15",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-border bg-background text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
