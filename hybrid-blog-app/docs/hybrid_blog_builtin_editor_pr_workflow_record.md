# Hybrid Blog Built-In Editor PR Workflow Record

This document records the server-backed built-in Markdown editor work.

## Scope

Completed in this iteration:

1. Converted the Astro app to Node server output with `@astrojs/node`.
2. Added GitHub OAuth sign-in for editor sessions.
3. Added encrypted, HTTP-only editor session cookies.
4. Added server-side content validation and path guards for `posts`, `notes`, and `demos`.
5. Added GitHub PR publishing through origin branches for collaborators and forks for non-collaborators.
6. Updated `/editor/` to submit draft or publish PRs instead of copy/download write-back.

Not included:

1. Direct commits to `main`.
2. Public anonymous content submission.
3. A database-backed account system.
4. Media upload through the built-in editor.

## Runtime

The app now builds with:

```ts
output: "server"
adapter: node({ mode: "standalone" })
```

Existing dynamic content routes are explicitly prerendered so public pages still behave like static content pages while editor API routes run on the server.

## Required Environment

```text
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_REPO_OWNER=Dutch-voyage
GITHUB_REPO_NAME=Hyblog
GITHUB_CALLBACK_URL=http://127.0.0.1:4321/api/auth/github/callback
SESSION_SECRET
```

`SESSION_SECRET` must be at least 32 characters.

The GitHub OAuth App's Authorization callback URL must exactly match `GITHUB_CALLBACK_URL`.

## Editor APIs

Added:

```text
GET  /api/editor/session
GET  /api/editor/content/:collection/:slug
POST /api/editor/proposals
GET  /api/auth/github/login
GET  /api/auth/github/callback
GET  /api/auth/github/logout
```

`POST /api/editor/proposals` validates frontmatter, collection, slug, source path, and stale file SHA before writing to GitHub.

## Publishing Behavior

1. Users sign in with GitHub.
2. Existing content loads the latest Markdown from GitHub and stores the current file SHA.
3. Saving as draft forces `status: "draft"`.
4. Publishing forces `status: "published"`.
5. If the user can push to the origin repo, the server writes to `cms/{user}/{slug}` in origin and opens a PR to `main`.
6. Otherwise, the server creates or reuses the user's fork, writes to `cms/{user}/{slug}`, and opens a PR back to `Dutch-voyage/Hyblog:main`.

## Verification

Executed:

```bash
npm run test
npm run build
```

Both passed.
