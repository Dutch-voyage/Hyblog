import type { APIRoute } from "astro";
import { getEditorEnvironmentStatus, getEditorGitHubConfig } from "@/lib/editor/config";
import { buildGitHubAuthorizeUrl } from "@/lib/editor/github";
import {
  createOAuthState,
  sanitizeReturnTo,
  setOAuthStateCookie,
} from "@/lib/editor/session";

export const GET: APIRoute = ({ cookies, redirect, url }) => {
  const environment = getEditorEnvironmentStatus();
  if (!environment.configured) {
    return new Response(
      `GitHub editor integration is not configured. Missing: ${environment.missing.join(", ")}`,
      {
        status: 503,
        headers: {
          "content-type": "text/plain;charset=utf-8",
        },
      },
    );
  }

  const config = getEditorGitHubConfig();
  const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo"));
  const state = `${createOAuthState()}:${Buffer.from(returnTo, "utf8").toString("base64url")}`;
  const redirectUri = config.callbackUrl ?? new URL("/api/auth/github/callback", url).toString();

  setOAuthStateCookie(cookies, url, state);

  return redirect(
    buildGitHubAuthorizeUrl({
      clientId: config.clientId,
      state,
      redirectUri,
    }),
    302,
  );
};
