# Hybrid Blog CMS Integration Record

This document records the non-deployment follow-up work completed after the initial Astro blog scaffold. The priority for this iteration was Pages CMS integration.

## Scope

Completed in this iteration:

1. Improved Pages CMS configuration.
2. Added editable site-level settings.
3. Aligned Astro content schema with CMS authoring behavior.
4. Added tag browsing and local static search to make CMS-authored content easier to discover.
5. Kept deployment out of scope.

Not included:

1. No deployment platform setup.
2. No GitHub Pages, Vercel, Netlify, or Cloudflare configuration.
3. No public user system.
4. No external CMS service.
5. No agent API.

## CMS Changes

### `.pages.yml`

The Pages CMS configuration now includes:

1. Repository-wide commit templates for create, update, delete, and rename actions.
2. `settings.content.merge: true`, so Pages CMS preserves unmanaged keys instead of rewriting files too aggressively.
3. Safe image upload handling through `public/images` with `rename: safe`.
4. A `Site settings` file editor for `src/site.config.json`.
5. Collection editor views for `posts`, `notes`, and `demos`.
6. Filename templates based on the primary field, shown only when creating a new entry.
7. Explicit `format: yaml-frontmatter` for Markdown and MDX content.
8. Cover image and canonical URL fields for all content collections.
9. Code-editor body handling for MDX demo pages, which is safer than rich-text editing for JSX/MDX content.

### Site Settings

Added `src/site.config.json` as the editable site metadata source.

It currently controls:

1. Site title.
2. Site description.
3. Author.
4. HTML language.
5. Homepage eyebrow.
6. Homepage headline.
7. Homepage intro.
8. Navigation links.

The Astro layout and homepage now read from this file through `src/lib/site.ts`.

### Content Schema

Updated `src/content.config.ts` so CMS-authored content is less fragile:

1. Added optional `slug` support in case CMS-created content includes it later.
2. Added empty-string handling for optional URL fields.
3. Kept `posts`, `notes`, and `demos` as separate collections.
4. Kept status filtering through `draft` and `published`.

This means an empty CMS input for `canonicalUrl`, `demoUrl`, or `repositoryUrl` will not break the Astro build.

## Authoring Workflow

Recommended Pages CMS workflow:

1. Edit global copy in `Site settings`.
2. Create posts in `Posts`.
3. Create short updates in `Notes`.
4. Create MDX demos in `Demos`.
5. Upload images through the configured media library.
6. Keep entries as `draft` until they are ready to appear on the public site.
7. Publish by switching `status` to `published`.

The public site only renders entries whose `status` is `published`.

## Discovery Improvements

### Tags

Added:

1. `src/pages/tags/index.astro`
2. `src/pages/tags/[tag].astro`

Tags are generated from the `tags` field in CMS-authored content. Each tag page lists all published entries with that tag across posts, notes, and demos.

### Search

Added:

1. `src/pages/search/index.astro`

The search page uses a static client-side index generated at build time from published content. It searches:

1. Title.
2. Description.
3. Tags.
4. Content type.

It does not require a backend service or deployment-specific configuration.

## Shared Content Helpers

Added `src/lib/content.ts` for shared content behavior:

1. Collection path mapping.
2. Entry URL generation.
3. Published-entry querying.
4. Newest-first sorting.
5. Tag collection and tag slug generation.

This keeps homepage, tag pages, and search from duplicating content-query logic.

## Files Added

```text
src/lib/content.ts
src/lib/site.ts
src/pages/search/index.astro
src/pages/tags/index.astro
src/pages/tags/[tag].astro
src/site.config.json
hybrid_blog_cms_integration_record.md
```

## Files Updated

```text
.pages.yml
src/content.config.ts
src/layouts/BaseLayout.astro
src/pages/index.astro
src/pages/rss.xml.ts
tsconfig.json
```

## Verification Plan

Run these locally before committing:

```bash
npm run check
npm run build
```

No deployment command is needed for this iteration.

## Next Non-Deployment Work

Suggested next steps:

1. Add an editor-facing content style guide.
2. Add draft previews for trusted editors.
3. Add schema checks for recommended tag format.
4. Add a content quality checklist for agent-generated drafts.
5. Decide later whether RSS should stay posts-only, include all content, or be removed until needed.
