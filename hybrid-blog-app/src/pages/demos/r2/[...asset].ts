import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { serveSvizDemo } from "../../../lib/svizStorage";

export const prerender = false;
export const GET: APIRoute = async ({ params, request }) => {
  try {
    return await serveSvizDemo(env.DEMOS_BUCKET, params.asset ?? "", request);
  } catch {
    return new Response("Demo storage is temporarily unavailable", { status: 503 });
  }
};
export const HEAD = GET;
