---
title: "Publishing Workflow"
description: "How content moves from draft to published in Hybrid Blog."
updatedDate: 2026-05-06
---

# Publishing Workflow

Hybrid Blog uses Git-based publishing. Pages CMS edits files in the repository, and the site only renders content whose `status` is `published`.

## Standard Flow

1. Create a new entry in Pages CMS.
2. Keep `status` as `draft`.
3. Fill title, description, date, authors, tags, formats, and body.
4. Preview locally or through a future preview environment.
5. Review metadata and links.
6. Change `status` to `published`.
7. Commit through Pages CMS or Git.

## Review Checklist

Before publishing:

1. The title is specific.
2. The description explains the page in one sentence.
3. Tags are useful and not duplicated.
4. Authors match `src/data/authors.json`.
5. Links open correctly.
6. Images have a clear purpose.
7. Any AI or agent contribution has been reviewed by a human.

## Draft Policy

Drafts can be incomplete, but they should not contain secrets, credentials, private URLs, or unreviewed personal data.

If an entry contains uncertain information, keep it as `draft` until the claim is checked.
