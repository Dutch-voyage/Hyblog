import { describe, expect, it } from "vitest";
import { isServerAssetRequest } from "./pages-access.mjs";

describe("Pages server asset protection", () => {
  it.each([
    "/_worker.js", "/_worker.js/index.js", "/_worker.js/chunks/content.mjs",
    "/%5fworker.js/entry.mjs", "//_worker.js/entry.mjs",
    "/_astro/..%2f_worker.js/entry.mjs", "/demos/..%2f_worker.js/entry.mjs",
    "/%5c_worker.js/entry.mjs", "/_worker.js%2fentry.mjs", "/%zz",
  ])("blocks %s before the asset server", (path) => {
    expect(isServerAssetRequest(`https://blog.example${path}`)).toBe(true);
  });

  it.each(["/", "/content/post/", "/editor/workspace/", "/_astro/app.js", "/demos/sviz/nested.json"])(
    "allows normal routing for %s", (path) => {
      expect(isServerAssetRequest(`https://blog.example${path}`)).toBe(false);
    },
  );
});
