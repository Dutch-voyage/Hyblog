import { getCollection, type CollectionEntry } from "astro:content";

export const collectionPaths = {
  posts: "posts",
  notes: "notes",
  demos: "demos",
} as const;

export type PublishedEntry =
  | CollectionEntry<"posts">
  | CollectionEntry<"notes">
  | CollectionEntry<"demos">;

export type BlogEntry = PublishedEntry;

export function getPublicEntrySlug(entry: BlogEntry) {
  return entry.data.slug ?? entry.id;
}

export function getEntryHref(entry: BlogEntry) {
  return `/content/${getPublicEntrySlug(entry)}/`;
}

export function getEntryEditHref(entry: BlogEntry) {
  return `/editor/?entry=${encodeURIComponent(`${entry.collection}:${entry.id}`)}`;
}

export function getDraftPreviewHref(entry: BlogEntry) {
  return `/drafts/${collectionPaths[entry.collection]}/${entry.id}/`;
}

export function getEntrySourcePath(entry: BlogEntry) {
  const extension = entry.collection === "demos" ? "mdx" : "md";
  return `src/content/${collectionPaths[entry.collection]}/${entry.id}.${extension}`;
}

export function sortByNewest(entries: BlogEntry[]) {
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getAllEntries() {
  const [posts, notes, demos] = await Promise.all([
    getCollection("posts"),
    getCollection("notes"),
    getCollection("demos"),
  ]);

  return sortByNewest([...posts, ...notes, ...demos]);
}

export async function getPublishedEntries() {
  const entries = await getAllEntries();
  return entries.filter((entry) => entry.data.status === "published");
}

export async function getDraftEntries() {
  const entries = await getAllEntries();
  return entries.filter((entry) => entry.data.status === "draft");
}

export function getAllTags(entries: BlogEntry[]) {
  return Array.from(new Set(entries.flatMap((entry) => entry.data.tags))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function slugifyTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
