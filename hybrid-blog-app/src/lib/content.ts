import { getCollection, type CollectionEntry } from "astro:content";

export const collectionPaths = {
  posts: "posts",
  notes: "notes",
} as const;

export type PublishedEntry =
  | CollectionEntry<"posts">
  | CollectionEntry<"notes">;

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

export function canPreviewDrafts() {
  return import.meta.env.DEV || import.meta.env.ENABLE_DRAFT_PREVIEWS === "true";
}

export function getEntrySourcePath(entry: BlogEntry) {
  return `hybrid-blog-app/src/content/${collectionPaths[entry.collection]}/${entry.id}.md`;
}

export function sortByNewest(entries: BlogEntry[]) {
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getAllEntries() {
  const [posts, notes] = await Promise.all([
    getCollection("posts"),
    getCollection("notes"),
  ]);

  return sortByNewest([...posts, ...notes]);
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
