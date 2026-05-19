import type { APIRoute } from "astro";
import { getEditorRepositoryConfig } from "@/lib/editor/config";
import { EditorProposalError, createEditorProposal } from "@/lib/editor/proposals";
import { readEditorSession, verifyToken } from "@/lib/editor/session";

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export const POST: APIRoute = async ({ cookies, request }) => {
  const session = readEditorSession(cookies);
  if (!session) {
    return json({ error: "Sign in with GitHub before submitting content." }, { status: 401 });
  }

  const csrf = request.headers.get("x-csrf-token") ?? "";
  if (!verifyToken(csrf, session.csrfToken)) {
    return json({ error: "Invalid editor session token." }, { status: 403 });
  }

  let body: {
    collection?: string;
    slug?: string | null;
    markdown?: string;
    baseSha?: string | null;
    intent?: "draft" | "publish";
  };

  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected a JSON request body." }, { status: 400 });
  }

  if (!body.collection || !body.markdown || (body.intent !== "draft" && body.intent !== "publish")) {
    return json({ error: "collection, markdown, and intent are required." }, { status: 400 });
  }

  try {
    const result = await createEditorProposal(
      {
        token: session.token,
        login: session.login,
        collection: body.collection,
        slug: body.slug,
        markdown: body.markdown,
        baseSha: body.baseSha,
        intent: body.intent,
      },
      {
        config: getEditorRepositoryConfig(),
      },
    );

    return json(result);
  } catch (error) {
    if (error instanceof EditorProposalError) {
      return json({ error: error.message }, { status: error.status });
    }

    return json({ error: "Failed to create editor proposal." }, { status: 500 });
  }
};

