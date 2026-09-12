import type { JSX, ReactNode } from "react";
import { slugifyHeading } from "@/lib/content/headings";

function headingText(children?: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children
      .map((child) => (typeof child === "string" ? child : ""))
      .join("");
  }
  return "";
}

/**
 * Returns a heading element with an `id` slug so the TableOfContents sidebar
 * can deep-link to it. Used as the MDX components for h1-h6.
 */
export function createMdHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return function MdHeading({ children }: { children?: ReactNode }) {
    return <Tag id={slugifyHeading(headingText(children))}>{children}</Tag>;
  };
}
