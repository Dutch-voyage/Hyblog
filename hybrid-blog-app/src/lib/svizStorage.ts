import type { R2Bucket } from "@cloudflare/workers-types";
import { parseSvizDisplayJson, SvizImportError } from "./svizImport";
import { validateSlug } from "./editor/content";

// Restrict public reads to demo objects created by this application.
export function svizObjectKey(asset: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[a-z0-9\u4e00-\u9fa5][a-z0-9\u4e00-\u9fa5-]*\.json$/.test(asset)) {
    return null;
  }
  return `sviz/${asset}`;
}

export async function storeSvizDemo(bucket: R2Bucket, source: string, slug: string) {
  validateSlug(slug);
  // Preserve the compiled payload exactly; do not rebuild or stringify large displays.
  const { visualization_id: visualizationId, format, format_version: formatVersion } = parseSvizDisplayJson(source);
  const asset = `${crypto.randomUUID()}/${slug}.json`;
  const result = await bucket.put(svizObjectKey(asset)!, source, {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
    customMetadata: { format, formatVersion },
  });
  if (!result) throw new Error("Demo storage did not complete.");
  return { src: `/demos/r2/${asset}`, visualizationId };
}

export async function serveSvizDemo(bucket: R2Bucket | undefined, asset: string, request: Request) {
  const key = svizObjectKey(asset);
  if (!key) return new Response("Not found", { status: 404 });
  if (!bucket) return new Response("Demo storage is not configured", { status: 503 });
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=31536000, immutable",
    "ETag": object.httpEtag,
    "X-Content-Type-Options": "nosniff",
  });
  const tags = request.headers.get("if-none-match")?.split(",").map(tag => tag.trim().replace(/^W\//, ""));
  if (tags?.includes("*") || tags?.includes(object.httpEtag)) {
    await object.body.cancel();
    return new Response(null, { status: 304, headers });
  }
  headers.set("Content-Length", String(object.size));
  if (request.method === "HEAD") {
    await object.body.cancel();
    return new Response(null, { headers });
  }
  // Stream from R2; fetching a large demo must not buffer it in Worker memory.
  return new Response(object.body as unknown as ReadableStream<Uint8Array>, { headers });
}

export function svizUploadError(error: unknown) {
  if (error instanceof SvizImportError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Demo upload failed. Please retry." }, { status: 500 });
}
