# Hybrid Blog Editorial Workflow Record

This document records the next non-deployment iteration after the CMS integration work. The goal was to make the blog easier to operate as a human-and-agent editorial system.

## Scope

Completed in this iteration:

1. Added CMS-editable author profiles.
2. Added public author pages.
3. Added CMS-editable editorial workflow documents.
4. Added an agent draft review checklist.
5. Kept deployment out of scope.

Not included:

1. No deployment setup.
2. No authentication.
3. No private admin area.
4. No automatic publication from agents.
5. No database-backed user profiles.

## Author Profiles

Added `src/data/authors.json` as the author profile source.

Current profiles:

1. `owner`: the main editor and author.
2. `agent`: a draft contributor identity for reviewed agent-assisted content.

Each profile supports:

1. `id`
2. `name`
3. `role`
4. `bio`
5. `links`

Pages CMS can now edit this file through the `Authors` entry in `.pages.yml`.

## Author Pages

Added:

```text
src/pages/authors/index.astro
src/pages/authors/[author].astro
src/lib/authors.ts
```

The site now supports:

1. `/authors/`: lists all configured authors.
2. `/authors/owner/`: lists content authored by `owner`.
3. `/authors/agent/`: lists reviewed content attributed to `agent`.

The main navigation now includes `作者`.

## Editorial Documents

Added CMS-editable editorial documents:

```text
src/editorial/style-guide.md
src/editorial/publishing-workflow.md
src/editorial/agent-draft-checklist.md
```

These files are configured under the `Editorial workflow` group in Pages CMS.

### Style Guide

The style guide defines:

1. Voice and tone.
2. Structure for posts, notes, and demos.
3. Required metadata.
4. Tagging conventions.

### Publishing Workflow

The publishing workflow defines:

1. Draft-to-published flow.
2. Review checklist.
3. Draft policy.
4. Human review expectations.

### Agent Draft Checklist

The agent draft checklist defines:

1. Required checks before publishing agent-assisted content.
2. Good tasks for agents.
3. High-risk tasks requiring extra human review.
4. The rule that agents may draft but not publish directly.

## CMS Changes

Updated `.pages.yml` with:

1. An `Authors` JSON file editor.
2. Author ID validation using lowercase letters, numbers, and hyphens.
3. An `Editorial workflow` group.
4. File editors for the style guide, publishing workflow, and agent draft checklist.

This keeps editorial operations inside Pages CMS without requiring a custom admin panel.

## Product Rationale

The blog is intended to support personal writing, invited contributors, and agent-assisted drafts. The minimum viable governance layer is therefore:

1. Clear author identities.
2. Clear draft/publish rules.
3. Clear agent review rules.
4. CMS-editable documentation for the workflow.

This is lighter than building authentication or a custom editorial backend, but it creates enough structure for safe content growth.

## Verification Plan

Run:

```bash
npm run build
```

Expected result:

1. Astro check passes.
2. Static build succeeds.
3. `/authors/` and `/authors/[author]/` pages are generated.
4. Editorial markdown files remain CMS-editable and do not affect public routing.

## Next Non-Deployment Work

Suggested next steps:

1. Add a content validation script for author IDs and duplicate tags.
2. Add a local preview command note for CMS editors.
3. Add a PR checklist for agent-generated drafts.
4. Add lightweight link checking for published content.
5. Treat RSS as optional until there is a clear subscriber use case.
