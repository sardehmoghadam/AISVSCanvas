import { cn } from "@/lib/utils";

export function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: "note" | "warning" | "secure" | "insecure";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    note: "border-sky-500/25 bg-sky-500/10 text-sky-950 dark:text-sky-50",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-50",
    secure: "border-emerald-500/25 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50",
    insecure: "border-rose-500/25 bg-rose-500/10 text-rose-950 dark:text-rose-50",
  } as const;

  return (
    <aside role="note" className={cn("rounded-2xl border p-5 shadow-sm", styles[kind])}>
      <p className="font-semibold">{title}</p>
      <div className="mt-2 text-sm leading-6 opacity-95">{children}</div>
    </aside>
  );
}
