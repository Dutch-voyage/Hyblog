import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isPrivateEditorPath, requireEditorLogin } from "./access";
import { editorSessionCookie, sealSession, sanitizeReturnTo, type CookieWriter } from "./session";

vi.mock("./env", () => ({ readEditorEnv: (name: string) => process.env[name] }));

const secret = "a-private-editor-test-secret-with-32-characters";
const session = {
  token: "test-github-token", login: "editor", userId: 1, csrfToken: "test-csrf",
  createdAt: new Date().toISOString(),
};
const cookies = (value?: string): CookieWriter => ({
  get: (name) => value && name === editorSessionCookie ? { value } : undefined,
  set: () => {}, delete: () => {},
});

describe("GitHub editor access", () => {
  beforeEach(() => vi.stubEnv("SESSION_SECRET", secret));
  afterEach(() => vi.unstubAllEnvs());

  it.each(["/editor", "/editor/", "/editor/workspace/", "/drafts/", "/drafts/notes/private/", "/api/editor/content/notes/private"])(
    "protects %s for guests", async (path) => {
      expect(isPrivateEditorPath(path)).toBe(true);
      const response = await requireEditorLogin(cookies(), new URL(path, "https://blog.example"));
      expect(response?.status).toBe(path.startsWith("/api/") ? 401 : 302);
      expect(response?.headers.get("Cache-Control")).toBe("private, no-store");
      expect(response?.headers.get("X-Robots-Tag")).toContain("noindex");
      expect(await response?.text()).not.toContain("test-github-token");
    },
  );

  it("preserves the requested editor URL through login", async () => {
    const url = new URL("https://blog.example/editor/?entry=notes%3Aprivate");
    const response = await requireEditorLogin(cookies(), url);
    const login = new URL(response!.headers.get("Location")!, url);
    expect(login.searchParams.get("returnTo")).toBe(url.pathname + url.search);
  });

  it("accepts a valid GitHub session", async () => {
    const sealed = await sealSession(session, secret);
    expect(await requireEditorLogin(cookies(sealed), new URL("https://blog.example/drafts/"))).toBeNull();
  });

  it.each(["forged-cookie", "local-browser-account"])("rejects %s", async (value) => {
    expect((await requireEditorLogin(cookies(value), new URL("https://blog.example/editor/")))?.status).toBe(302);
  });

  it("rejects expired sessions even if the cookie is replayed", async () => {
    const sealed = await sealSession({ ...session, createdAt: "2020-01-01T00:00:00Z" }, secret);
    expect((await requireEditorLogin(cookies(sealed), new URL("https://blog.example/editor/")))?.status).toBe(302);
  });

  it("leaves public routes outside the editor gate", () => {
    for (const path of ["/", "/content/post/", "/search/", "/account/", "/editorial/"]) {
      expect(isPrivateEditorPath(path)).toBe(false);
    }
  });

  it.each(["//evil.example", "/\\evil.example", "/\n/evil.example"])("rejects unsafe return URL %j", (value) => {
    expect(sanitizeReturnTo(value)).toBe("/editor/");
  });
});
