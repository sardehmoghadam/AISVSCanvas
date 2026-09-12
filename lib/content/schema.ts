import { z } from "zod";
import { standard } from "../../config/standard";

/**
 * Zod schemas for MDX control frontmatter.
 *
 * A control page is authored as a single `.mdx` file. The frontmatter carries
 * structured metadata (identity, taxonomy, difficulty, references, tags), and
 * the markdown body carries the educational narrative and code examples.
 *
 * Every id shape is defined by `config/standard.ts`, so the same schema powers
 * Any standard (ASVS, MASVS, AISVS, ...) without code changes. AISVS, for
 * example, models `C1` -> chapter, `C1.1` -> section, `C1.1.1` -> control.
 */

const nonEmptyString = z.string().trim().min(1);

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Expected a lowercase kebab-case slug");

const groupIdSchema = z
  .string()
  .regex(
    standard.groupIdPattern,
    `Expected a ${standard.groupLabel} id such as ${standard.examples.groupId}`,
  );

const sectionIdSchema = z
  .string()
  .regex(
    standard.sectionIdPattern,
    `Expected a ${standard.sectionLabel} id such as ${standard.examples.sectionId}`,
  );

const controlIdSchema = z
  .string()
  .regex(
    standard.controlIdPattern,
    `Expected a control id such as ${standard.examples.controlId}`,
  );

const canonicalIdSchema = z
  .string()
  .regex(
    standard.canonicalIdPattern,
    `Expected a canonical id such as ${standard.examples.canonicalId}`,
  );

export const DifficultySchema = z.enum(["foundational", "intermediate", "advanced"]);

export const ReviewStatusSchema = z.enum(["draft", "reviewed", "needs-update"]);

const levelIds = standard.levels.map((level) => level.id) as [string, ...string[]];
export const LevelSchema = z.enum(levelIds);

export const ReferenceSchema = z.object({
  label: nonEmptyString,
  url: z.string().url(),
});

export const RelatedControlSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  href: nonEmptyString,
});

export const CodeExampleMetaSchema = z.object({
  language: nonEmptyString,
  label: nonEmptyString,
  filename: nonEmptyString.optional(),
  secure: z.boolean().optional(),
});

export const ControlFrontmatterSchema = z
  .object({
    schemaVersion: z.string().default("1.0.0"),
    standardVersion: z.string().default(standard.version),
    controlId: controlIdSchema,
    canonicalId: canonicalIdSchema.optional(),
    slug: slugSchema,
    title: nonEmptyString,
    summary: nonEmptyString,
    chapter: z.object({
      id: groupIdSchema,
      title: nonEmptyString,
    }),
    section: z
      .object({
        id: sectionIdSchema,
        title: nonEmptyString,
      })
      .optional(),
    levels: z.array(LevelSchema).default([]),
    tags: z.array(nonEmptyString).default([]),
    keywords: z.array(nonEmptyString).default([]),
    difficulty: DifficultySchema.default("foundational"),
    reviewStatus: ReviewStatusSchema.default("draft"),
    references: z.array(ReferenceSchema).default([]),
    relatedControls: z.array(RelatedControlSchema).default([]),
  })
  .superRefine((data, context) => {
    // Keep the taxonomy internally consistent: chapter and section ids are
    // derived from the control id, so authors cannot mismatch them.
    const expectedGroupId = standard.deriveGroupId(data.controlId);
    const expectedSectionId = standard.deriveSectionId(data.controlId);
    const expectedCanonicalId = standard.buildCanonicalId(data.controlId);

    if (data.chapter.id !== expectedGroupId) {
      context.addIssue({
        code: "custom",
        path: ["chapter", "id"],
        message: `${standard.groupLabel} id must be ${expectedGroupId} for control ${data.controlId}`,
      });
    }

    if (standard.hasSections) {
      if (!data.section) {
        context.addIssue({
          code: "custom",
          path: ["section"],
          message: `A ${standard.sectionLabel} is required for ${standard.name} ${standard.version} controls`,
        });
      } else if (data.section.id !== expectedSectionId) {
        context.addIssue({
          code: "custom",
          path: ["section", "id"],
          message: `${standard.sectionLabel} id must be ${expectedSectionId} for control ${data.controlId}`,
        });
      }
    }

    if (data.canonicalId && data.canonicalId !== expectedCanonicalId) {
      context.addIssue({
        code: "custom",
        path: ["canonicalId"],
        message: `Canonical id must be ${expectedCanonicalId}`,
      });
    }
  });

export type ControlFrontmatter = z.infer<typeof ControlFrontmatterSchema>;
export type ControlReference = z.infer<typeof ReferenceSchema>;
export type ControlRelated = z.infer<typeof RelatedControlSchema>;
export type ControlCodeExampleMeta = z.infer<typeof CodeExampleMetaSchema>;
