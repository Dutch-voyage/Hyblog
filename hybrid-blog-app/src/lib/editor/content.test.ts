import { describe, expect, it } from "vitest";
import {
  EditorContentError,
  getEditorContentPath,
  prepareEditorContent,
  setMarkdownStatus,
  slugifyTitle,
  validateSlug,
} from "./content";

const validMarkdown = `---
title: "Hello Editor"
description: "A draft from the editor."
pubDate: 2026-05-18
authors:
  - "owner"
tags:
  - "cms"
status: "draft"
formats:
  - "blog"
---

Body text.`;

describe("editor content validation", () => {
  it("prepares a valid post path and generated slug", () => {
    const prepared = prepareEditorContent({
      collection: "posts",
      markdown: validMarkdown,
      intent: "draft",
    });

    expect(prepared.slug).toBe("hello-editor");
    expect(prepared.path).toBe("hybrid-blog-app/src/content/posts/hello-editor.md");
    expect(prepared.status).toBe("draft");
  });

  it("uses mdx for demos", () => {
    expect(getEditorContentPath("demos", "first-demo")).toBe(
      "hybrid-blog-app/src/content/demos/first-demo.mdx",
    );
  });

  it("sets publish status before validation", () => {
    const prepared = prepareEditorContent({
      collection: "notes",
      slug: "hello-editor",
      markdown: validMarkdown,
      intent: "publish",
    });

    expect(prepared.status).toBe("published");
    expect(prepared.markdown).toContain('status: "published"');
  });

  it("rejects path traversal slugs", () => {
    expect(() => validateSlug("../secret")).toThrow(EditorContentError);
    expect(() => validateSlug("bad/path")).toThrow(EditorContentError);
  });

  it("rejects invalid frontmatter", () => {
    expect(() =>
      prepareEditorContent({
        collection: "posts",
        markdown: validMarkdown.replace("pubDate: 2026-05-18", "pubDate: yesterday"),
        intent: "draft",
      }),
    ).toThrow("pubDate");
  });

  it("slugifies titles deterministically", () => {
    expect(slugifyTitle(" Hello, CMS World! ")).toBe("hello-cms-world");
  });

  it("can add a missing status field", () => {
    expect(setMarkdownStatus(validMarkdown.replace('status: "draft"\n', ""), "published")).toContain(
      'status: "published"',
    );
  });
});

