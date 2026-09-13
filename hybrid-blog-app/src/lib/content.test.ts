import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: async (collection: string) => ["draft", "staged", "published"].map((status) => ({
    id: `${collection}-${status}`,
    collection,
    data: { status, pubDate: new Date("2026-09-07"), tags: [`${status}-tag`] },
  })),
}));

import { getAllEntries, getAllTags, getDraftEntries, getPublishedEntries } from "./content";

describe("content visibility", () => {
  it("exposes only published content to public pages, search, feeds, and tag lists", async () => {
    const entries = await getPublishedEntries();
    expect(entries.map((entry) => entry.id)).toEqual(["posts-published", "notes-published"]);
    expect(getAllTags(entries)).toEqual(["published-tag"]);
  });

  it("keeps drafts and staged content available for authenticated previews", async () => {
    const entries = await getDraftEntries();
    expect(entries.map((entry) => entry.id)).toEqual(["posts-draft", "posts-staged", "notes-draft", "notes-staged"]);
    expect(await getAllEntries()).toHaveLength(6);
  });
});
