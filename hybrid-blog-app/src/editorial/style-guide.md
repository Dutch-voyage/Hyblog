---
title: "Editorial Style Guide"
description: "Writing and formatting rules for Hybrid Blog content."
updatedDate: 2026-09-08
---

# Editorial Style Guide

Hybrid Blog content should feel clear, useful, and easy to reuse across formats.

## Voice

Write in a practical, calm tone. Prefer concrete explanation over slogans. If a post is exploratory, say what is known, what is uncertain, and what should be tested next.

## Structure

Default to concise writing. Use `src/content/posts/cuda-cross-stream-waits.md` as the reference for technical Q&A posts: brief assumptions, the original teaching snippet, one focused question, then minimal fixes with short explanations. Keep only details needed to understand correctness and the key tradeoff, with relevant source links. Do not expand one topic into multiple Q&As, repeat the conclusion, or add long introductions, recaps, or peripheral caveats. Add depth only when requested; preserve the user's concise revisions.

For long posts:

1. Start with the problem or motivation.
2. Explain the decision or experiment.
3. Show implementation notes, evidence, or examples.
4. End with what changed or what comes next.

For notes:

1. Keep one core idea per note.
2. Use a short title that can stand alone.
3. Add tags that make the note discoverable later.

For articles containing demos:

1. Explain what the demo proves.
2. Link to the live demo or repository when available.
3. Include limitations so readers do not overinterpret the result.

## Metadata

Every CMS entry should include:

1. `title`
2. `description`
3. `pubDate`
4. `authors`
5. `tags`
6. `status`
7. `formats`

Use `draft` until the piece is reviewed. Use `published` only when the page is ready to appear publicly.

For GPU systems grill posts, prefix each title with its discussion number: `Q1：`, `Q2：`, and so on. Keep the same number when revising a post. Credit agent-authored posts with author ID `agent`, displayed as `Codex Agent`. After preparing and checking a draft, create a draft pull request automatically; publication and merging remain separate actions.

## Tags

Use short lowercase tags when possible, such as `astro`, `cms`, `agent`, `demo`, or `product`.

Avoid creating near-duplicates like `AI`, `ai`, `aigc`, and `agent-ai` unless they mean different things in the content model.
