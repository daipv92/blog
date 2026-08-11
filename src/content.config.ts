import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";
import { SERIES } from "@/data/series";

const seriesSlugs = SERIES.map(series => series.slug);

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      // Series taxonomy (see docs/website-content-sdd.md §2): slug must exist
      // in the src/data/series.ts registry. Validated at content-parse time so
      // even drafts fail fast instead of breaking the build on publish day.
      series: z
        .string()
        .refine(slug => seriesSlugs.includes(slug), {
          message: `series must be one of: ${seriesSlugs.join(", ")} (register new series in src/data/series.ts)`,
        })
        .optional(),
      seriesOrder: z.number().optional(),
      articleType: z
        .enum(["big-question", "case-study", "deep-dive", "field-note"])
        .optional(),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.url().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

export const collections = { posts, pages };
