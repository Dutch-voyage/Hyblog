import type { APIRoute } from "astro";
import { getEditorEnvironmentStatus, getEditorRepositoryConfig } from "@/lib/editor/config";
import { getRepositoryOrNull } from "@/lib/editor/github";
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

export const GET: APIRoute = async ({ cookies, url }) => {
  const environment = getEditorEnvironmentStatus();
  const repository = getEditorRepositoryConfig();
  const returnTo = `${url.pathname}${url.search}`;
  const loginUrl = `/api/auth/github/login?returnTo=${encodeURIComponent(returnTo)}`;
  const logoutUrl = `/api/auth/github/logout?returnTo=${encodeURIComponent(returnTo)}`;

  if (!environment.configured) {
    return json({
      authenticated: false,
      configured: false,
      missingEnv: environment.missing,
      loginUrl,
      repository,
    });
  }

  let session = null;
  try {
    session = readEditorSession(cookies);
  } catch (error) {
    return json(
      {
        authenticated: false,
        configured: false,
        error: error instanceof Error ? error.message : "Editor session is not configured.",
      },
      { status: 500 },
    );
  }

  if (!session) {
    return json({
      authenticated: false,
      configured: true,
      loginUrl,
      repository,
    });
  }

  const repo = await getRepositoryOrNull(
    session.token,
    repository.owner,
    repository.repo,
    undefined,
  );
  const canPush = Boolean(repo?.permissions?.admin || repo?.permissions?.push);

  return json({
    authenticated: true,
    configured: true,
    csrfToken: session.csrfToken,
    loginUrl,
    logoutUrl,
    user: {
      login: session.login,
      id: session.userId,
      avatarUrl: session.avatarUrl,
    },
    repository: {
      ...repository,
      canPush,
      visible: Boolean(repo),
    },
  });
};
