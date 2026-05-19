import type { APIRoute } from "astro";
import { clearEditorSessionCookie, sanitizeReturnTo } from "@/lib/editor/session";

export const GET: APIRoute = ({ cookies, redirect, url }) => {
  clearEditorSessionCookie(cookies, url);
  return redirect(sanitizeReturnTo(url.searchParams.get("returnTo")), 302);
};

