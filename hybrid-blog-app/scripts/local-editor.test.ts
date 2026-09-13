import { testPdf } from "./test-pdf";
import { createServer, type Server } from "node:http";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { localEditorPlugin } from "./local-editor";
import type { ViteDevServer } from "vite";

const markdown = `---\ntitle: "Local draft"\ndescription: "Saved on disk"\npubDate: 2026-09-14\nstatus: "draft"\nauthors:\n  - "owner"\n---\n\nExact **Markdown**.\n`;
let root: string, origin: string, token: string, server: Server;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "hyblog-local-editor-"));
  await mkdir(path.join(root, "src/content/posts"), { recursive: true });
  await mkdir(path.join(root, "src/content/notes"), { recursive: true });
  const plugin = localEditorPlugin(root);
  const setup = plugin.configureServer as (server: ViteDevServer) => void;
  setup({ middlewares: { use: (handler: Function) => { server = createServer((req, res) => handler(req, res, () => { res.statusCode = 404; res.end(); })); } } } as unknown as ViteDevServer);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  origin = `http://127.0.0.1:${address.port}`;
  token = (await (await fetch(`${origin}/__local-editor/session`)).json()).token;
});
afterEach(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
  await rm(root, { recursive: true, force: true });
});
function get(slug = "local-draft") {
  return fetch(`${origin}/__local-editor/content?collection=posts&slug=${encodeURIComponent(slug)}`, { headers: { "x-local-editor-token": token } });
}
function save(previous: string | null, content = markdown, headers = {}) {
  return fetch(`${origin}/__local-editor/content?collection=posts&slug=local-draft`, {
    method: "POST", headers: { "content-type": "application/json", "origin": origin, "x-local-editor-token": token, ...headers },
    body: JSON.stringify({ markdown: content, revision: previous }),
  });
}

describe("local editor filesystem saves", () => {
  it("saves figure uploads through the protected endpoint", async () => {
    const bytes = testPdf();
    const url = `${origin}/__local-editor/figures?name=plot.pdf`;
    expect((await fetch(url, { method: "POST", body: bytes })).status).toBe(403);
    const response = await fetch(url, { method: "POST", headers: { origin, "x-local-editor-token": token }, body: bytes });
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.kind).toBe("pdf");
    const served = await fetch(origin + result.src);
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toBe("application/pdf");
    expect(Buffer.from(await served.arrayBuffer())).toEqual(bytes);
    expect(await readFile(path.join(root, result.path))).toEqual(bytes);
  }, 40000);
  it("creates, reads and updates exact Markdown without changing status", async () => {
    const response = await save(null);
    expect(response.status).toBe(200);
    const created = await response.json();
    expect(await readFile(path.join(root, created.path), "utf8")).toBe(markdown);
    expect((await (await get()).json()).markdown).toBe(markdown);
    const updated = markdown.replace('"draft"', '"published"');
    expect((await save(created.revision, updated)).status).toBe(200);
    expect(await readFile(path.join(root, created.path), "utf8")).toBe(updated);
  });
  it("rejects stale revisions and serializes simultaneous saves", async () => {
    const first = await (await save(null)).json();
    expect((await save(null)).status).toBe(409);
    const results = await Promise.all([save(first.revision, markdown + "one"), save(first.revision, markdown + "two")]);
    expect(results.map(r => r.status).sort()).toEqual([200, 409]);
  });
  it("does not overwrite edits made outside the browser", async () => {
    const first = await (await save(null)).json();
    await writeFile(path.join(root, first.path), markdown + "external edit");
    expect((await save(first.revision)).status).toBe(409);
    expect(await readFile(path.join(root, first.path), "utf8")).toContain("external edit");
  });
  it("rejects cross-origin writes, missing tokens, traversal and invalid content", async () => {
    expect((await save(null, markdown, { origin: "https://evil.test" })).status).toBe(403);
    expect((await save(null, markdown, { "x-local-editor-token": "wrong" })).status).toBe(403);
    expect((await save(null, "no frontmatter")).status).toBe(400);
    expect((await get("../outside")).status).toBe(400);
    expect((await fetch(`${origin}/__local-editor/session`, { headers: { "sec-fetch-site": "cross-site" } })).status).toBe(403);
  });
  it("preserves existing MDX paths and rejects symlinks", async () => {
    await writeFile(path.join(root, "src/content/posts/local-draft.mdx"), markdown);
    const existing = await (await get()).json();
    expect(existing.path).toMatch(/\.mdx$/);
    expect((await save(existing.revision, markdown + "MDX")).status).toBe(200);
    await symlink(path.join(root, "src/content/posts/local-draft.mdx"), path.join(root, "src/content/posts/linked.md"));
    expect((await get("linked")).status).toBe(403);
  });
});
