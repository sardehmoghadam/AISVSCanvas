import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium leading-none transition-colors",
        variant === "default" && "bg-primary/10 text-primary ring-1 ring-primary/15",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-border bg-background text-muted-foreground",
        variant === "success" && "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300",
        variant === "warning" && "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-300",
        className,
      )}
      {...props}
    />
  );
}
