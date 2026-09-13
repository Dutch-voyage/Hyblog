# GitHub editor workspace

Open `/editor/workspace/` from the site's Edit navigation. The workspace lists the deployed content with search, collection, and draft/staged/published filters. Choose Preview or Edit, or create a new entry. GitHub login is required for the workspace, editor, private previews, and content APIs. The separate browser-local reader account does not provide access.

The existing GitHub PR workflow is preserved. Save draft, Stage, Publish, and Return to draft submit content changes for review. Changes take effect on the site after merging into the configured base branch and completing a fresh deployment. Unmerged changes are available in the PR linked by the editor. Returning a published entry to draft removes its public page and all public listings on that deployment.

## Configuration

Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and a random `SESSION_SECRET` of at least 32 characters in the Cloudflare Pages runtime environment. Use the repository settings and optional callback override shown in `.env.example`. Register the deployed `/api/auth/github/callback` URL in the GitHub OAuth app. Secrets are resolved from the adapter's runtime bindings.

Run `npm run build` from the repository root. It builds Astro and packages both client assets and the server in the Cloudflare Pages advanced-mode `_worker.js/` directory. Deploy the root `dist` directory using the existing Pages configuration. Copying only `dist/client` would omit authentication and the workspace routes.

`ENABLE_DRAFT_PREVIEWS` no longer enables anonymous access. All private routes are rendered on request, require a valid encrypted GitHub session, send `Cache-Control: private, no-store`, and are excluded from the sitemap. Sessions expire after seven days, including when an expired cookie is replayed.

This access control applies to the site. It does not change a GitHub repository's visibility or protect files placed in `public/`. Any authenticated GitHub user can view the workspace and propose changes, while repository permissions still control merging.

## Verification

Run `npm test` and `npm --prefix hybrid-blog-app run build`. Tests cover anonymous, forged, and expired sessions; safe login return paths; draft/staged filtering; and publishing status transitions. Local HTTP checks should confirm that guests receive login redirects for private pages, 401 for private content APIs, and 404 for unpublished public URLs. Authenticated responses should include private/no-store headers.
