import { describe, expect, it } from "vitest";
import { previewMarkdown } from "./markdown";

describe("editor math preview", () => {
  it("renders inline and display formulas", () => {
    const html = previewMarkdown.parse("$x^2$\n\n$$\n\\frac{D}{B}\n$$", { async: false });
    expect(html).toContain('class="katex"');
    expect(html).toContain('class="katex-display"');
  });

  it("preserves code and reports invalid formulas without crashing", () => {
    expect(previewMarkdown.parse("`$x$`", { async: false })).toContain("<code>$x$</code>");
    expect(previewMarkdown.parse("$\\frac{1}{$", { async: false })).toContain("katex-error");
  });

  it("does not enable trusted HTML commands in formulas", () => {
    const html = previewMarkdown.parse("$\\href{javascript:alert(1)}{click}$", { async: false });
    expect(html).not.toContain("<a ");
  });
});
