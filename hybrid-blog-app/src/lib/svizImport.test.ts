import { describe, expect, it } from "vitest";
import {
  SvizImportError,
  parseSvizDisplayJson,
  prepareSvizAsset,
  renderSvizMarkdownEmbed,
  slugifySvizAsset,
} from "./svizImport";

const validDisplay = {
  format: "sviz-display",
  format_version: "0.2-draft",
  visualization_id: "service-map",
  title: "Service map",
  description: null,
  execution: { checkpoints: [{ id: "start" }] },
  display: { views: [{ id: "overview", kind: "spatial" }] },
};

describe("sviz JSON imports", () => {
  it("validates and prepares a canonical public asset", () => {
    const prepared = prepareSvizAsset(JSON.stringify(validDisplay), "service-map");

    expect(prepared.path).toBe("hybrid-blog-app/public/demos/sviz/service-map.json");
    expect(prepared.document.visualization_id).toBe("service-map");
    expect(prepared.content).toBe(`${JSON.stringify(validDisplay, null, 2)}\n`);
  });

  it("rejects source IR and incompatible display versions", () => {
    expect(() => parseSvizDisplayJson(JSON.stringify({ ...validDisplay, format: "sviz" }))).toThrow(
      SvizImportError,
    );
    expect(() =>
      parseSvizDisplayJson(JSON.stringify({ ...validDisplay, format_version: "0.1" })),
    ).toThrow("0.2-draft");
  });

  it("requires rendered views and checkpoints", () => {
    expect(() =>
      parseSvizDisplayJson(JSON.stringify({ ...validDisplay, display: { views: [] } })),
    ).toThrow("compiled view");
    expect(() =>
      parseSvizDisplayJson(JSON.stringify({ ...validDisplay, execution: { checkpoints: [] } })),
    ).toThrow("compiled checkpoint");
  });

  it("accepts compiled demos larger than 30 MiB", () => {
    const description = "x".repeat(31 * 1024 * 1024);
    const prepared = prepareSvizAsset(
      JSON.stringify({ ...validDisplay, description }),
      "large-demo",
    );

    expect(prepared.document.description).toBe(description);
    expect(JSON.parse(prepared.content).description).toBe(description);
  });

  it("creates a Markdown-compatible embed snippet", () => {
    expect(slugifySvizAsset("Service Map / v2")).toBe("service-map-v2");
    expect(
      renderSvizMarkdownEmbed({
        assetSlug: "service-map",
        visualizationId: "service-map",
        caption: "Service map",
      }),
    ).toContain('src="/demos/sviz/service-map.json"');
    expect(
      renderSvizMarkdownEmbed({
        assetSlug: "service-map",
        visualizationId: "service-map",
        caption: "Service map",
      }),
    ).toContain("systems-viz-next.js");
  });
});
