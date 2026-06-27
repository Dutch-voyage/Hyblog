import type { APIRoute } from "astro";
import { getEditorGitHubConfig } from "@/lib/editor/config";
import { exchangeOAuthCode, getAuthenticatedUser } from "@/lib/editor/github";
import {
  clearOAuthStateCookie,
  createCsrfToken,
  decodeBase64UrlText,
  readOAuthStateCookie,
  sanitizeReturnTo,
  setEditorSessionCookie,
  verifyToken,
} from "@/lib/editor/session";

function decodeReturnTo(state: string) {
  const encoded = state.split(":")[1];
  if (!encoded) return "/editor/";

  try {
    return sanitizeReturnTo(decodeBase64UrlText(encoded));
  } catch {
    return "/editor/";
  }
}

export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readOAuthStateCookie(cookies);
  clearOAuthStateCookie(cookies, url);

  if (!code || !state || !expectedState || !verifyToken(state, expectedState)) {
    return new Response("Invalid GitHub OAuth state.", { status: 400 });
  }

  const config = getEditorGitHubConfig();
  const token = await exchangeOAuthCode({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    code,
  });
  const user = await getAuthenticatedUser(token);

  await setEditorSessionCookie(cookies, url, {
    token,
    login: user.login,
    userId: user.id,
    avatarUrl: user.avatar_url,
    csrfToken: createCsrfToken(),
    createdAt: new Date().toISOString(),
  });

  return redirect(decodeReturnTo(state), 302);
};
