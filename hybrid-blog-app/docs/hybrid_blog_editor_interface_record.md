# Hybrid Blog Editor Interface Record

This document records the editor interface and draft preview work.

## Scope

Completed in this iteration:

1. Added a static editor workspace.
2. Added a browser-side content draft composer.
3. Added source-path and preview links for existing content.
4. Added opt-in draft preview routes.
5. Added a draft sample for preview verification.
6. Deprioritized RSS in documented next steps.

Not included:

1. No deployment changes.
2. No server-side write API.
3. No authentication.
4. No public draft exposure by default.
5. No CMS provider-specific deep-linking.

## Editor Workspace

Added:

```text
src/pages/editor/index.astro
```

The editor workspace is available at:

```text
/editor/
```

It provides:

1. A content draft generator for posts, notes, and demos.
2. Frontmatter generation for title, description, date, authors, tags, status, formats, and demo URL.
3. A list of existing content entries.
4. Source file paths for each entry.
5. Public links for published entries.
6. Draft preview links when draft previews are explicitly enabled.

The editor page is still static. It does not write files directly. Authors should copy generated output into Git or Pages CMS.

## Draft Preview Safety

Added:

```text
src/pages/drafts/[collection]/[slug].astro
```

Draft preview pages are opt-in only.

Default build behavior:

1. Draft entries are not listed on public content pages.
2. Draft entries are not listed in `/editor/`.
3. `/drafts/` pages are not generated.

Preview build behavior:

```bash
ENABLE_DRAFT_PREVIEWS=true npm run build
```

When enabled:

1. Draft entries appear in `/editor/`.
2. Draft preview routes are generated under `/drafts/{collection}/{slug}/`.
3. Draft preview pages show a visible warning banner.

Do not publish a build generated with `ENABLE_DRAFT_PREVIEWS=true`.

## Draft Sample

Added:

```text
src/content/notes/editor-draft-preview.md
```

This entry uses:

```yaml
status: "draft"
authors:
  - "agent"
```

It exists to verify draft preview behavior without appearing in normal public builds.

## Shared Content Helpers

Updated:

```text
src/lib/content.ts
```

New helper behavior:

1. Query all entries.
2. Query draft entries.
3. Generate draft preview URLs.
4. Generate source file paths.
5. Keep published-entry filtering available for public pages.

## Navigation

Updated:

```text
src/site.config.json
```

Added `编辑` to the site navigation so the editor workspace is reachable.

## RSS Priority

RSS is no longer treated as an immediate next step. Existing RSS support can stay, but future work should prioritize:

1. editor workflow,
2. draft preview safety,
3. content validation,
4. author/agent review flow.

## Verification

Run normal build:

```bash
npm run build
```

Expected result:

1. Build passes.
2. Draft page is not generated.
3. `/editor/` lists only published content.

Run draft preview build:

```bash
ENABLE_DRAFT_PREVIEWS=true npm run build
```

Expected result:

1. Build passes.
2. `/drafts/notes/editor-draft-preview/` is generated.
3. `/editor/` includes the draft preview entry.
