import { testPdf } from "./test-pdf";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { saveLocalFigure } from "./local-figures";
import { figureMarkdown } from "../src/lib/figureImport";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9l8AAAAASUVORK5CYII=", "base64");
describe("local figures", () => {
  it("stores PNG, JPEG and PDF bytes and creates the right Markdown syntax", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "hyblog-figures-"));
    try {
      for (const [name, bytes] of [["A figure.PNG", png], ["plot.jpeg", Buffer.from([255,216,255,224,0,2,255,217])], ["plot.pdf", testPdf()]] as const) {
        const saved = await saveLocalFigure(root, name, bytes);
        expect(await readFile(path.join(root, saved.path))).toEqual(bytes);
        if (saved.kind === "pdf") {
          expect(saved.previewSrc).toMatch(/-page-1\.png$/);
          const preview = await readFile(path.join(root, "public", saved.previewSrc!));
          expect(preview.subarray(1, 4).toString()).toBe("PNG");
          expect(preview.readUInt32BE(16)).toBe(2400);
          expect(figureMarkdown(saved.src, "Plot", saved.previewSrc)).toContain("](/figures/");
        }
        expect(figureMarkdown(saved.src, "A [caption]")).toContain("A \\[caption\\]");
        expect(figureMarkdown(saved.src, "Plot").startsWith("!")).toBe(saved.kind === "image");
      }
    } finally { await rm(root, { recursive: true, force: true }); }
  }, 40000);
  it("reuses identical assets while keeping different uploads with the same name separate", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "hyblog-figures-"));
    try {
      const first = await saveLocalFigure(root, "figure.png", png);
      expect(await saveLocalFigure(root, "figure.png", png)).toEqual(first);
      expect((await saveLocalFigure(root, "figure.png", Buffer.concat([png, Buffer.from("changed")]))).src).not.toBe(first.src);
      await expect(saveLocalFigure(root, "figure.png", Buffer.from("<script>"))).rejects.toThrow();
      await expect(saveLocalFigure(root, "figure.svg", png)).rejects.toThrow();
      const safe = await saveLocalFigure(root, "../../plot.png", png);
      expect(safe.path).toMatch(/^public\/figures\/plot-/);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it("rejects unsafe URLs and escapes captions", () => {
    expect(() => figureMarkdown("javascript:alert(1)", "test")).toThrow();
    expect(figureMarkdown("/figures/图-123.png", "line\n[caption]")).toBe("![line \\[caption\\]](/figures/%E5%9B%BE-123.png)");
  });
});
