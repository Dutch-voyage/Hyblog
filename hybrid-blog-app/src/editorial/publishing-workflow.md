---
title: "Publishing Workflow"
description: "How content moves from draft to published in Hybrid Blog."
updatedDate: 2026-09-07
---

# Publishing Workflow

Hybrid Blog uses Git-based publishing. Pages CMS edits files in the repository, and the site only renders content whose `status` is `published`.

## Standard Flow

1. Open `/editor/workspace/` and sign in with GitHub.
2. Create content or choose an existing entry to edit.
3. Save a draft PR while writing, or a staged PR when it is ready for review.
4. Review the PR, merge it, and wait for the site deployment. The workspace reflects the deployed repository version; unmerged changes remain in the linked PR.
5. Preview draft and staged entries from the workspace while signed in.
6. Submit a publish PR, then merge and deploy to make the entry public.

## Visibility and Returning to Draft

- `draft`: work in progress, visible on this site only after GitHub login.
- `staged`: ready for review, visible on this site only after GitHub login.
- `published`: visible to guests in the feed, search, tags, authors, RSS, and its public URL.

To unpublish, open a published entry in the editor and choose **Return to draft**. This submits a PR setting `status: draft`. After merging and redeploying, the public URL returns 404 and the entry disappears from public listings. It remains available in the authenticated workspace and preview routes. Until deployment finishes, the previously published version remains public.

The browser-local reader account does not grant editor access. All GitHub-authenticated users can view the workspace and propose changes; GitHub repository permissions and PR review govern merging. The site login gate does not change the visibility of source files in GitHub or files stored under `public/`.

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
