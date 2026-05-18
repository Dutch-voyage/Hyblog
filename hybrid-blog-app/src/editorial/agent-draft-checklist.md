---
title: "Agent Draft Checklist"
description: "Review checklist for content drafted with agent assistance."
updatedDate: 2026-05-06
---

# Agent Draft Checklist

Agent-generated drafts must be treated as drafts until reviewed. The agent can help create structure and examples, but it should not publish directly.

## Required Checks

Before publishing an agent-assisted entry:

1. Confirm the article matches the intended topic.
2. Remove hallucinated facts, fake links, and unsupported claims.
3. Check all commands, code snippets, and URLs.
4. Ensure no secrets, tokens, private paths, or private personal data are included.
5. Make the author field honest. Use `agent` only when the draft meaningfully came from agent work.
6. Add an owner review before changing `status` to `published`.

## Good Agent Tasks

Agents are useful for:

1. Producing first drafts.
2. Rewriting one source article into multiple content formats.
3. Generating summaries.
4. Suggesting tags.
5. Creating demo scripts.
6. Checking broken internal links.

## Tasks Requiring Extra Care

Use human review for:

1. Technical claims.
2. Security advice.
3. Legal or policy content.
4. Personal stories.
5. Public API documentation.
6. Cost or pricing statements.

## Publishing Rule

An agent may create a branch or draft entry, but publication requires a human decision.
