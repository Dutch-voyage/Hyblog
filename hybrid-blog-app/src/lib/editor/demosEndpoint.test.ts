import type { APIContext } from "astro";
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ session: vi.fn(), repo: vi.fn(), env: {} as { DEMOS_BUCKET?: unknown } }));
vi.mock("cloudflare:workers", () => ({ env: mocks.env }));
vi.mock("./session", () => ({ readEditorSession: mocks.session, verifyToken: (a: string, b: string) => a === b }));
vi.mock("./config", () => ({ getEditorRepositoryConfig: () => ({ owner: "owner", repo: "blog" }) }));
vi.mock("./github", () => ({ getRepositoryOrNull: mocks.repo }));
import { POST } from "../../pages/api/editor/demos";

const fixture = readFileSync(new URL("../../../public/demos/sviz/nested-example.json", import.meta.url), "utf8");
function upload(body = fixture, csrf = "csrf", contentType = "application/json", slug = "demo") {
  const url = new URL(`https://blog.test/api/editor/demos?slug=${encodeURIComponent(slug)}`);
  return POST({ url, cookies: {}, request: new Request(url, { method: "POST", headers: { "content-type": contentType, "x-csrf-token": csrf }, body }) } as APIContext);
}

describe("authenticated demo uploads", () => {
  let put: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue({ token: "token", csrfToken: "csrf" });
    mocks.repo.mockResolvedValue({ permissions: { push: true } });
    put = vi.fn().mockResolvedValue({});
    mocks.env.DEMOS_BUCKET = { put };
  });
  it("rejects guests and invalid CSRF tokens before writing", async () => {
    mocks.session.mockResolvedValueOnce(null);
    expect((await upload()).status).toBe(401);
    expect((await upload(fixture, "wrong")).status).toBe(403);
    expect(put).not.toHaveBeenCalled();
  });
  it("requires repository write access for public uploads", async () => {
    mocks.repo.mockResolvedValue({ permissions: { pull: true } });
    expect((await upload()).status).toBe(403);
    expect(put).not.toHaveBeenCalled();
  });
  it("reports missing configuration, invalid names, media types, and JSON", async () => {
    expect((await upload(fixture, "csrf", "text/html")).status).toBe(415);
    expect((await upload(fixture, "csrf", "application/json", "../oops")).status).toBe(400);
    expect((await upload("{")).status).toBe(400);
    delete mocks.env.DEMOS_BUCKET;
    expect((await upload()).status).toBe(503);
    expect(put).not.toHaveBeenCalled();
  });
  it("returns a compatible public URL only after storage succeeds", async () => {
    const response = await upload();
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ src: expect.stringMatching(/^\/demos\/r2\/.+\/demo.json$/), visualizationId: JSON.parse(fixture).visualization_id });
    expect(put.mock.calls[0][1]).toBe(fixture);
  });
  it("returns a retryable error on storage failure", async () => {
    put.mockRejectedValue(new Error("internal storage detail"));
    const response = await upload();
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("internal storage detail");
  });
});
