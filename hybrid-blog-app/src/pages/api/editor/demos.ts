import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { readEditorSession, verifyToken } from "../../../lib/editor/session";
import { getEditorRepositoryConfig } from "../../../lib/editor/config";
import { getRepositoryOrNull } from "../../../lib/editor/github";
import { storeSvizDemo, svizUploadError } from "../../../lib/svizStorage";
import { validateSlug } from "../../../lib/editor/content";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request, url }) => {
  const session = await readEditorSession(cookies);
  if (!session) return Response.json({ error: "Sign in with GitHub before uploading a demo." }, { status: 401 });
  if (!verifyToken(request.headers.get("x-csrf-token") ?? "", session.csrfToken)) {
    return Response.json({ error: "Invalid editor session token." }, { status: 403 });
  }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return Response.json({ error: "Upload a compiled sviz JSON file." }, { status: 415 });
  }
  const slug = url.searchParams.get("slug") ?? "";
  try { validateSlug(slug); } catch {
    return Response.json({ error: "Invalid demo asset name." }, { status: 400 });
  }
  const bucket = env.DEMOS_BUCKET;
  if (!bucket) {
    return Response.json({ error: "Demo storage is not configured. Bind DEMOS_BUCKET to the R2 bucket and redeploy." }, { status: 503 });
  }
  try {
    // R2 uploads are immediately addressable, unlike contributions awaiting PR review.
    const config = getEditorRepositoryConfig();
    const repo = await getRepositoryOrNull(session.token, config.owner, config.repo);
    if (!repo?.permissions?.push && !repo?.permissions?.admin) {
      return Response.json({ error: "Repository write access is required to upload demos." }, { status: 403 });
    }
    const result = await storeSvizDemo(bucket, await request.text(), slug);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return svizUploadError(error);
  }
};
