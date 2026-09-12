import { DocsSidebar } from "@/components/docs-sidebar";

export function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <DocsSidebar />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
