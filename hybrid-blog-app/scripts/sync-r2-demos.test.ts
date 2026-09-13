import { describe, expect, it, vi } from "vitest";
import { demoReferences, syncDemos } from "./sync-r2-demos.mjs";

const ref = "/demos/r2/90520822-b4dd-494f-a4ad-bda886429642/agentic-uniform.json";
const bytes = Buffer.from(JSON.stringify({
  format: "sviz-display", format_version: "0.2-draft", visualization_id: "test", title: "test",
  execution: { checkpoints: [{}] }, display: { views: [{}] },
}));
const json = (body: Buffer | null = bytes) => new Response(body === null ? null : new Uint8Array(body), { headers: { "content-type": "application/json" } });

describe("production R2 publishing", () => {
  it("finds unique references in Markdown and MDX without including static demos", () => {
    expect(demoReferences(`<systems-viz-next src="${ref}" />\n${ref}\n/demos/sviz/test.json`)).toEqual([ref]);
  });

  it("check mode reports missing demos without fetching locally or uploading", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    const upload = vi.fn();
    await expect(syncDemos([ref], { check: true, fetcher, upload })).rejects.toThrow("npm run sync:demos");
    expect(upload).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("copies missing objects under the existing key, preserves bytes and verifies production", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(json()).mockResolvedValueOnce(json());
    const upload = vi.fn();
    await syncDemos([ref], { fetcher, upload, log: vi.fn() });
    expect(upload).toHaveBeenCalledExactlyOnceWith("sviz/90520822-b4dd-494f-a4ad-bda886429642/agentic-uniform.json", bytes);
    expect(fetcher.mock.calls.map(call => call[0])).toEqual([
      "https://hyblog.me" + ref, "http://localhost:4321" + ref, "https://hyblog.me" + ref,
    ]);
  });

  it("never overwrites an existing production object", async () => {
    const fetcher = vi.fn().mockResolvedValue(json(null));
    const upload = vi.fn();
    await syncDemos([ref], { fetcher, upload, log: vi.fn() });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(upload).not.toHaveBeenCalled();
  });

  it.each([403, 503])("does not treat HTTP %s as a missing object", async status => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status }));
    const upload = vi.fn();
    await expect(syncDemos([ref], { fetcher, upload })).rejects.toThrow(`HTTP ${status}`);
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects fallback HTML even if its status is 200", async () => {
    await expect(syncDemos([ref], { fetcher: vi.fn().mockResolvedValue(new Response("page")) })).rejects.toThrow("expected demo JSON");
  });

  it("rejects invalid compiled data before uploading", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(json(Buffer.from("{}")));
    const upload = vi.fn();
    await expect(syncDemos([ref], { fetcher, upload })).rejects.toThrow("sviz-display");
    expect(upload).not.toHaveBeenCalled();
  });

  it("fails if production returns different bytes after upload", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(json()).mockResolvedValueOnce(json(Buffer.from("{}")));
    await expect(syncDemos([ref], { fetcher, upload: vi.fn() })).rejects.toThrow("SHA-256 verification");
  });
});
