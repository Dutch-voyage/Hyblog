import { defineMiddleware } from "astro:middleware";
import { isPrivateEditorPath, privateHeaders, requireEditorLogin } from "./lib/editor/access";

export const onRequest = defineMiddleware(async (context, next) => {
  const privatePage = isPrivateEditorPath(context.url.pathname);
  const authPage = context.url.pathname.startsWith("/api/auth/github/") || context.url.pathname.startsWith("/login");
  // The session endpoint must also be readable while logged out.
  if (privatePage && context.url.pathname.replace(/\/$/, "") !== "/api/editor/session") {
    const denied = await requireEditorLogin(context.cookies, context.url);
    if (denied) return denied;
  }

  const response = await next();
  if (!privatePage && !authPage) return response;
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(privateHeaders)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
