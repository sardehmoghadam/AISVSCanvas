import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Callout } from "@/components/callout";
import { CodeTabs } from "@/components/code-tabs";
import { createMdHeading } from "@/components/mdx-heading";
import { ReferencesList } from "@/components/references-list";
import { RelatedControls } from "@/components/related-controls";
import { ControlFrontmatterSchema, type ControlFrontmatter } from "./schema";

export const CONTROLS_DIR = path.join(process.cwd(), "content", "controls");

export type ControlEntry = {
  frontmatter: ControlFrontmatter;
  body: string;
};

function listControlFiles(): string[] {
  if (!fs.existsSync(CONTROLS_DIR)) return [];
  return fs
    .readdirSync(CONTROLS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(CONTROLS_DIR, file));
}

/**
 * Loads every control entry from disk.
 *
 * This function runs at build time (static generation). Files are read
 * synchronously and validated with Zod so malformed content fails the build
 * instead of rendering broken pages.
 */
export function getAllControls(): ControlEntry[] {
  return listControlFiles().map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    const parsed = ControlFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid control frontmatter in ${path.basename(filePath)}: ${parsed.error.message}`,
      );
    }

    return {
      frontmatter: parsed.data,
      body: content,
    };
  });
}

export function getControlBySlug(slug: string): ControlEntry | undefined {
  return getAllControls().find((entry) => entry.frontmatter.slug === slug);
}

export function getControlsByChapter(chapterId: string): ControlEntry[] {
  return getAllControls().filter(
    (entry) => entry.frontmatter.chapter.id === chapterId,
  );
}

export function getControlsBySection(sectionId: string): ControlEntry[] {
  return getAllControls().filter(
    (entry) => entry.frontmatter.section?.id === sectionId,
  );
}

export type CompiledControl = {
  frontmatter: ControlFrontmatter;
  content: React.ReactNode;
};

/**
 * Compiles a single MDX body into a React element for server rendering.
 *
 * Custom MDX components are injected here so authors can use Callout, CodeTabs,
 * etc. directly in the markdown body.
 */
export async function compileControl(entry: ControlEntry): Promise<CompiledControl> {
  const { content } = await compileMDX({
    source: entry.body,
    components: {
      Callout,
      CodeTabs,
      ReferencesList,
      RelatedControls,
      h1: createMdHeading(1),
      h2: createMdHeading(2),
      h3: createMdHeading(3),
      h4: createMdHeading(4),
      h5: createMdHeading(5),
      h6: createMdHeading(6),
    },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return {
    frontmatter: entry.frontmatter,
    content,
  };
}
