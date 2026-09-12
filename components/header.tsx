import Link from "next/link";
import { Shield } from "lucide-react";
import { SearchBox } from "@/components/search-box";
import { ThemeToggle } from "@/components/theme-toggle";
import { standard } from "@/config/standard";

const navItems = [
  { href: `/categories/${standard.startCategorySlug}/`, label: `${standard.name} ${standard.version}` },
  { href: "/contribute/", label: "Contribute" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-1 py-1 font-semibold tracking-tight transition hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Shield className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">{standard.academyName}</span>
          <span className="sm:hidden">{standard.name}</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-2 text-sm md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden w-full max-w-sm md:block">
          <SearchBox compact />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
