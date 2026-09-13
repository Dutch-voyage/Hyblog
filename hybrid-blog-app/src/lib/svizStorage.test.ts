import type { R2Bucket } from "@cloudflare/workers-types";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { serveSvizDemo, storeSvizDemo, svizObjectKey } from "./svizStorage";
import { renderSvizMarkdownEmbed } from "./svizImport";

const fixture = readFileSync(new URL("../../public/demos/sviz/nested-example.json", import.meta.url), "utf8");
const asset = "12345678-1234-4123-8123-123456789abc/demo.json";

function storage() {
  const files = new Map<string, string>();
  const put = vi.fn(async (key: string, source: string) => {
    files.set(key, source);
    return { key };
  });
  const get = vi.fn(async (key: string) => {
    const source = files.get(key);
    if (!source) return null;
    return { body: new Response(source).body!, size: new TextEncoder().encode(source).length, httpEtag: '"etag"' };
  });
  return { files, put, get, bucket: { put, get } as unknown as R2Bucket };
}

describe("R2 compiled sviz demos", () => {
  it("preserves a real compiled fixture through upload, public serving, and the shipped viewer loader", async () => {
    const { bucket } = storage();
    const uploaded = await storeSvizDemo(bucket, fixture, "nested");
    const embed = renderSvizMarkdownEmbed({ assetSlug: "nested", src: uploaded.src, visualizationId: uploaded.visualizationId, caption: "Nested" });
    expect(embed).toContain(`src="${uploaded.src}"`);
    expect(embed).toContain('src="/demos/sviz/systems-viz-next.js"');
    const response = await serveSvizDemo(bucket, uploaded.src.slice("/demos/r2/".length), new Request(`https://blog.test${uploaded.src}`));
    expect(await response.text()).toBe(fixture);

    const runtime = readFileSync(new URL("../../public/demos/sviz/systems-viz-next.js", import.meta.url), "utf8");
    const Viewer = runInNewContext(`${runtime}\nSystemsVizNext`, {
      HTMLElement: class {}, customElements: { get: () => undefined, define: () => {} }, structuredClone,
      fetch: (src: string) => serveSvizDemo(bucket, src.slice("/demos/r2/".length), new Request(`https://blog.test${src}`)),
    });
    const viewer = Object.create(Viewer.prototype);
    Object.assign(viewer, {
      getAttribute: (key: string) => ({ src: uploaded.src, "visualization-id": uploaded.visualizationId })[key] ?? null,
      shadowRoot: { innerHTML: "" }, renderShell: vi.fn(), resizeObserver: { observe: vi.fn() },
      placeOffsets: {}, placeScales: {}, edgeOffsets: {},
    });
    await viewer.load();
    expect(viewer.shadowRoot.innerHTML).toBe("");
    expect(viewer.renderShell).toHaveBeenCalledOnce();
    expect(viewer.data).toEqual(JSON.parse(fixture));
  });

  it("stores and streams a compiled demo above 30 MiB", async () => {
    const { bucket } = storage();
    const source = JSON.stringify({ ...JSON.parse(fixture), description: "x".repeat(31 * 1024 * 1024) });
    const uploaded = await storeSvizDemo(bucket, source, "large");
    const response = await serveSvizDemo(bucket, uploaded.src.slice(10), new Request(`https://blog.test${uploaded.src}`));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(source);
  });

  it("rejects malformed JSON and uncompiled or incompatible documents before writing", async () => {
    const { bucket, put } = storage();
    for (const source of ["{", JSON.stringify({ ...JSON.parse(fixture), format: "sviz" }), JSON.stringify({ ...JSON.parse(fixture), format_version: "0.1" })]) {
      await expect(storeSvizDemo(bucket, source, "invalid")).rejects.toThrow();
    }
    expect(put).not.toHaveBeenCalled();
  });

  it("gives demos with the same slug independent immutable URLs", async () => {
    const { bucket, files } = storage();
    const first = await storeSvizDemo(bucket, fixture, "demo");
    const second = await storeSvizDemo(bucket, fixture, "demo");
    expect(first.src).not.toBe(second.src);
    expect(files.size).toBe(2);
  });

  it("restricts reads to generated demo keys and handles missing storage", async () => {
    const { bucket, get } = storage();
    expect(svizObjectKey("../secret.json")).toBeNull();
    expect((await serveSvizDemo(bucket, "../secret.json", new Request("https://blog.test"))).status).toBe(404);
    expect(get).not.toHaveBeenCalled();
    expect((await serveSvizDemo(bucket, asset, new Request("https://blog.test"))).status).toBe(404);
    expect((await serveSvizDemo(undefined, asset, new Request("https://blog.test"))).status).toBe(503);
  });

  it("supports HEAD and conditional caching without a response body", async () => {
    const { bucket, files } = storage();
    files.set(svizObjectKey(asset)!, fixture);
    const head = await serveSvizDemo(bucket, asset, new Request("https://blog.test", { method: "HEAD" }));
    expect(head.status).toBe(200);
    expect(head.headers.get("content-type")).toContain("application/json");
    expect(head.headers.get("cache-control")).toContain("immutable");
    expect(await head.text()).toBe("");
    const cached = await serveSvizDemo(bucket, asset, new Request("https://blog.test", { headers: { "if-none-match": 'W/"etag"' } }));
    expect(cached.status).toBe(304);
    expect(await cached.text()).toBe("");
  });
});
