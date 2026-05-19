import type { APIRoute } from "astro";
import { getEditorRepositoryConfig } from "@/lib/editor/config";
import {
  getEditorContentPath,
  isEditorCollection,
  validateSlug,
} from "@/lib/editor/content";
import { decodeGitHubContent, getContentFileOrNull } from "@/lib/editor/github";
import { readEditorSession } from "@/lib/editor/session";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export const GET: APIRoute = async ({ cookies, params }) => {
  const session = readEditorSession(cookies);
  if (!session) {
    return json({ error: "Sign in with GitHub before loading editable content." }, { status: 401 });
  }

  const collection = params.collection ?? "";
  const slug = params.slug ?? "";

  if (!isEditorCollection(collection)) {
    return json({ error: "Unsupported content collection." }, { status: 400 });
  }

  try {
    validateSlug(slug);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Invalid slug." },
      { status: 400 },
    );
  }

  const repository = getEditorRepositoryConfig();
  const path = getEditorContentPath(collection, slug);
  const file = await getContentFileOrNull(
    session.token,
    repository.owner,
    repository.repo,
    path,
    repository.baseBranch,
  );

  if (!file) {
    return json({ error: "Content file was not found on GitHub.", path }, { status: 404 });
  }

  return json({
    collection,
    slug,
    path,
    sha: file.sha,
    markdown: decodeGitHubContent(file),
  });
};

