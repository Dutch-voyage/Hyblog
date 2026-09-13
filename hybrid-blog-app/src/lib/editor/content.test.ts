import { describe, expect, it } from "vitest";
import {
  EditorContentError,
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

  it.each(["draft", "stage"] as const)("moves published content back to %s without changing its body or path", (intent) => {
    const prepared = prepareEditorContent({
      collection: "posts",
      slug: "hello-editor",
      markdown: validMarkdown.replace('status: "draft"', 'status: "published"'),
      intent,
    });
    expect(prepared.status).toBe(intent === "stage" ? "staged" : "draft");
    expect(prepared.markdown).not.toContain('status: "published"');
    expect(prepared.markdown).toContain("Body text.");
    expect(prepared.path).toBe("hybrid-blog-app/src/content/posts/hello-editor.md");
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
