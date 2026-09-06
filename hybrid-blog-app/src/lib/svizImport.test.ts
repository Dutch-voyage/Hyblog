import { describe, expect, it } from "vitest";
import {
  MAX_SVIZ_JSON_BYTES,
  SvizImportError,
  parseSvizDisplayJson,
  prepareSvizAsset,
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

  it("enforces the upload size limit", () => {
    expect(() => parseSvizDisplayJson(" ".repeat(MAX_SVIZ_JSON_BYTES + 1))).toThrow(
      "2 MiB",
    );
  });
});
