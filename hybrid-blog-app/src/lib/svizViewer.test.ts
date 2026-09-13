import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

// Exercise the shipped browser runtime without needing to construct its UI.
const runtime = readFileSync(new URL("../../public/demos/sviz/systems-viz-next.js", import.meta.url), "utf8");
const Viewer = runInNewContext(`${runtime}\nSystemsVizNext`, {
  HTMLElement: class {},
  customElements: { get: () => undefined, define: () => {} },
});

function renderPlace(color?: string, selected = false) {
  const plan = {
    label: "Rollout lanes",
    attrs: { element_colors: { "short-complete": color } },
    places: [{ id: "request", label: "S1", kind: "short-complete" }],
    roots: [], routes: [], draggable: [],
  };
  return Viewer.prototype.spatialSvg.call({
    profileGeometry: () => ({
      canvas: { width: 400, height: 200 },
      places: { request: { x: 10, y: 10, w: 100, h: 40 } },
    }),
    checkpoint: { cursor: 1, active_stages: [], materializations: [], resource_ledgers: [] },
    timelineViews: [], selection: selected ? "request" : null,
    relatedSelection: () => new Set(), shapeScale: 1,
    data: { execution: { unit: "step" } },
  }, plan) as string;
}

describe("bundled sviz viewer colors", () => {
  it("renders authored element colors from compiled display data", () => {
    const svg = renderPlace("#6597a6");
    expect(svg).toContain('fill="color-mix(in srgb, #6597a6 14%, var(--sv-panel))"');
    expect(svg).toContain('stroke="#6597a6"');
  });

  it("keeps authored fills when a request is selected", () => {
    const svg = renderPlace("#6597a6", true);
    expect(svg).toContain('fill="color-mix(in srgb, #6597a6 14%, var(--sv-panel))"');
    expect(svg).toContain('stroke="var(--sv-selection)" stroke-width="3"');
  });

  it("falls back for older displays and rejects markup in color values", () => {
    for (const color of [undefined, '\"><script>alert(1)</script>']) {
      const svg = renderPlace(color);
      expect(svg).toContain('fill="var(--sv-panel-soft)" stroke="var(--sv-border)"');
      expect(svg).not.toContain("<script>");
    }
  });
});
