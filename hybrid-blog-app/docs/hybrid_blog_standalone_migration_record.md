# Hybrid Blog Standalone Migration Record

This document records the migration of the current runnable blog work into a standalone app directory.

## Migration Goal

The goal was to separate the runnable Astro blog from repository-level workspace clutter and make it easier to treat the blog as its own app.

The standalone app directory is:

```text
hybrid-blog-app/
```

## What Moved

The following app files were moved under `hybrid-blog-app/`:

```text
astro.config.mjs
package.json
package-lock.json
tsconfig.json
src/
```

The existing project records and planning documents were moved under:

```text
hybrid-blog-app/docs/
```

This keeps the app, content, CMS configuration, and implementation records together.

## CMS Configuration

There are now two CMS config locations with different purposes:

```text
.pages.yml
hybrid-blog-app/.pages.yml
```

The root `.pages.yml` is kept for this repository because Pages CMS expects the config at the repository root. Its paths now point into `hybrid-blog-app/`.

The app-local `hybrid-blog-app/.pages.yml` is kept for portability. If the app directory is later split into its own repository, that file can become the repository-level Pages CMS config without path prefix changes.

## Media Directory

The app now contains:

```text
hybrid-blog-app/public/images/.gitkeep
```

This keeps the CMS media upload directory present in Git even before any images are uploaded.

## App-Level Ignore Rules

Added:

```text
hybrid-blog-app/.gitignore
```

The app-local ignore file mirrors the root ignore rules for:

1. dependencies,
2. build output,
3. Astro generated files,
4. local secrets,
5. deployment cache directories,
6. package manager logs.

## Content Credit

The sample blog content created so far is now credited to the agent author.

Updated content:

```text
hybrid-blog-app/src/content/posts/hello-hybrid-blog.md
hybrid-blog-app/src/content/notes/cold-start-idea.md
hybrid-blog-app/src/content/demos/first-demo.mdx
```

Each now uses:

```yaml
authors:
  - "agent"
```

The `agent` author profile was updated in:

```text
hybrid-blog-app/src/data/authors.json
```

The display name is now `GPT-5.5 Cursor Agent`.

## How To Work In The App

Run commands from the standalone app directory:

```bash
cd hybrid-blog-app
npm install
npm run dev
npm run build
```

No deployment setup was added during this migration.

## Verification Plan

After migration, run:

```bash
cd hybrid-blog-app
npm run build
```

Expected result:

1. Astro check passes.
2. Static build succeeds.
3. Author pages still generate.
4. The agent author page includes the sample post, note, and demo.
5. Root Pages CMS paths still point to app content.

## Verification Result

Verified from `hybrid-blog-app/`:

```bash
npm install
npm run build
```

Result:

1. Astro check completed with 0 errors, 0 warnings, and 0 hints.
2. Static build completed successfully.
3. 18 pages were generated.
4. `/authors/agent/` includes the credited sample post, note, and demo.

`npm install` still reports 5 moderate audit findings in the Astro check language-server dependency chain. This matches the earlier known dev-dependency audit issue and was not force-fixed because the suggested fix is breaking.
