import { readEditorSession, type CookieWriter } from "./session";

export const privateHeaders = {
  "Cache-Control": "private, no-store",
  "Vary": "Cookie",
  "X-Robots-Tag": "noindex, nofollow",
};

export function isPrivateEditorPath(pathname: string) {
  return ["/editor", "/drafts", "/api/editor"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function requireEditorLogin(cookies: CookieWriter, url: URL) {
  if (await readEditorSession(cookies)) return null;

  if (url.pathname.startsWith("/api/")) {
    return Response.json({ error: "Sign in with GitHub to access the editor workspace." }, {
      status: 401,
      headers: privateHeaders,
    });
  }

  const returnTo = encodeURIComponent(`${url.pathname}${url.search}`);
  return new Response(null, {
    status: 302,
    headers: { ...privateHeaders, Location: `/login/?returnTo=${returnTo}` },
  });
}
