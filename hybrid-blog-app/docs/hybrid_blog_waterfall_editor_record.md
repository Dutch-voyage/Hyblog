# Hybrid Blog Waterfall And Markdown Editor Record

This document records the homepage UI and editor workflow iteration.

## Scope

Completed in this iteration:

1. Changed the homepage from category entry points to a unified waterfall feed.
2. Added an explicit "expand more" button for PC-first browsing.
3. Removed article, note, demo, and tool category links from the frontend navigation.
4. Added a static Markdown/MDX editor for existing content in `/editor/`.
5. Changed the editor workflow so `/editor/` defaults to new-content creation only.
6. Added edit links on existing content pages that jump into entry-specific edit mode.
7. Added GitHub/VSCode-like edit and preview mode switching for Markdown content.
8. Added preview, copy, download, and publish-ready actions to the new-content workspace.
9. Added a publish-ready action to existing-content edit mode.
10. Clarified that the current publishing route remains Pages CMS or Git submission, not direct browser write-back.
11. Kept backend content collections unchanged for CMS and file organization.

Not included:

1. No deployment changes.
2. No server-side write API.
3. No authentication or permission model.
4. No browser-side direct file writes.

## Homepage

Updated:

```text
src/pages/index.astro
```

The homepage now presents published content as a single stream. The UI no longer sends readers through article, note, or demo entry cards. Those distinctions remain in the source tree and CMS configuration, but they are no longer part of the primary reader-facing information architecture.

The waterfall layout uses CSS columns so cards naturally stack into a masonry-like page. A browser-side button reveals more cards in batches, giving the PC homepage a clear expansion control.

## Public Content Routes

Added:

```text
src/pages/content/[slug].astro
```

Updated:

```text
src/lib/content.ts
src/pages/rss.xml.ts
```

Removed the old category route pages:

```text
src/pages/posts/*
src/pages/notes/*
src/pages/demos/*
```

Published content now uses unified public URLs:

```text
/content/{slug}/
```

The content collection folders still exist for CMS management and schema validation, but public cards, author pages, tag pages, search results, and RSS links now resolve through the unified content route.

## Navigation

Updated:

```text
src/site.config.json
```

Removed the frontend navigation links for:

1. Posts.
2. Notes.
3. Demos.
4. Tools.

The remaining navigation focuses on discovery and operation:

1. Tags.
2. Authors.
3. Search.
4. Editor.

## Markdown Editing

Updated:

```text
src/pages/editor/index.astro
src/pages/content/[slug].astro
src/pages/drafts/[collection]/[slug].astro
src/lib/content.ts
```

The editor workspace now has two separated entry points:

1. Directly opening `/editor/` creates a new Markdown/MDX draft from a structured form.
2. Opening `/editor/?entry={collection}:{id}` edits one existing content entry.

The new-content workspace exposes:

1. Generated Markdown/MDX output.
2. Browser-side preview for the generated content.
3. A "publish-ready" action that changes frontmatter `status` to `published`.
4. Copy and download actions for the generated file.
5. A Pages CMS entry link for the actual repository submission step.

Existing content is no longer listed inside the editor workspace. Published content pages and draft preview pages expose their own edit links, then pass the selected entry id through the query string. In edit mode, `/editor/` reconstructs frontmatter and body content from Astro content collection data, then exposes:

1. Source file path.
2. Editable Markdown/MDX textarea.
3. Edit and preview tabs.
4. Browser-side Markdown preview for images, code blocks, lists, tables, quotes, and links.
5. Copy to clipboard action.
6. Download file action.
7. A "publish-ready" action that changes frontmatter `status` to `published`.
8. A Pages CMS entry link for the actual repository submission step.
9. A link back to plain new-content mode.

This keeps "create a new post" and "edit this page" as separate navigation paths instead of presenting all existing content in the editor workspace.

This is intentionally still a static workflow. The current publishing route is Pages CMS or Git submission after previewing and preparing the Markdown. Direct write-back should only be added after designing authentication, authorization, file conflict handling, audit logging, and a multi-user local-file model with Git submission options.

The preview is implemented with `marked` and `dompurify`. The renderer strips frontmatter before previewing the body and sanitizes the generated HTML before inserting it into the page. This keeps the preview useful for quick authoring while avoiding direct unsanitized rendering of edited Markdown.

## CMS Boundary

Content collections remain separate under:

```text
src/content/posts
src/content/notes
src/content/demos
```

That structure is still useful for Pages CMS, Astro schemas, and build-time validation. The change is only in the reader-facing presentation: categories are now treated as backend management details instead of primary frontend navigation.

## Verification

Executed verification:

```bash
npm run test
npm run build
```

Result:

1. Vitest passed: 3 files, 16 tests.
2. Astro check passed: 0 errors, 0 warnings, 0 hints.
3. Astro build passed: 20 static pages generated.

Manual checks to perform in the browser:

1. `/` shows one unified waterfall feed with an expand button.
2. Public content links use `/content/{slug}/`.
3. The top navigation does not show posts, notes, demos, or tools.
4. `/editor/` opens as a new-content workspace by default.
5. Published content pages show an edit link to `/editor/?entry={collection}:{id}`.
6. Draft preview pages show an edit link when draft preview builds are enabled.
7. `/editor/?entry={collection}:{id}` loads that entry into the Markdown editor.
8. `/editor/` can preview new generated content before copying or downloading.
9. `/editor/` can generate publish-ready Markdown by setting `status: "published"`.
10. `/editor/` can switch between Markdown edit and preview modes while editing an existing entry.
11. Copy and download actions work for edited Markdown.
