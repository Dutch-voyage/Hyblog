import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const baseContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  authors: z.array(z.string()).default(["owner"]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("published"),
  cover: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: baseContentSchema.extend({
    type: z.literal("post").default("post"),
    formats: z.array(z.string()).default(["blog"]),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: baseContentSchema.extend({
    type: z.literal("note").default("note"),
    formats: z.array(z.string()).default(["short"]),
  }),
});

const demos = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/demos" }),
  schema: baseContentSchema.extend({
    type: z.literal("demo").default("demo"),
    demoUrl: z.string().url().optional(),
    repositoryUrl: z.string().url().optional(),
    formats: z.array(z.string()).default(["demo"]),
  }),
});

export const collections = { posts, notes, demos };
