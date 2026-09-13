import { validateSlug } from "./editor/content";

export const MAX_SVIZ_JSON_BYTES = 2 * 1024 * 1024;
export const SVIZ_DISPLAY_FORMAT = "sviz-display";
export const SVIZ_DISPLAY_VERSION = "0.2-draft";

export interface SvizDisplayDocument extends Record<string, unknown> {
  format: typeof SVIZ_DISPLAY_FORMAT;
  format_version: typeof SVIZ_DISPLAY_VERSION;
  visualization_id: string;
  title: string;
  description?: string | null;
  execution: Record<string, unknown> & { checkpoints: unknown[] };
  display: Record<string, unknown> & { views: unknown[] };
}

export interface PreparedSvizAsset {
  content: string;
  document: SvizDisplayDocument;
  path: string;
}

export class SvizImportError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SvizImportError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(document: Record<string, unknown>, key: string) {
  const value = document[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new SvizImportError(400, `sviz field "${key}" must be a non-empty string.`);
  }
  return value;
}

export function parseSvizDisplayJson(json: string): SvizDisplayDocument {
  if (new TextEncoder().encode(json).byteLength > MAX_SVIZ_JSON_BYTES) {
    throw new SvizImportError(413, "sviz JSON must be 2 MiB or smaller.");
  }

  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new SvizImportError(400, "The selected file is not valid JSON.");
  }

  if (!isRecord(value)) {
    throw new SvizImportError(400, "sviz JSON must contain one compiled display object.");
  }

  if (value.format !== SVIZ_DISPLAY_FORMAT || value.format_version !== SVIZ_DISPLAY_VERSION) {
    throw new SvizImportError(
      400,
      `The viewer requires ${SVIZ_DISPLAY_FORMAT} ${SVIZ_DISPLAY_VERSION}.`,
    );
  }

  requireNonEmptyString(value, "visualization_id");
  requireNonEmptyString(value, "title");

  if (value.description !== undefined && value.description !== null && typeof value.description !== "string") {
    throw new SvizImportError(400, 'sviz field "description" must be a string or null.');
  }

  if (!isRecord(value.execution) || !Array.isArray(value.execution.checkpoints) || value.execution.checkpoints.length === 0) {
    throw new SvizImportError(400, "sviz JSON must contain at least one compiled checkpoint.");
  }

  if (!isRecord(value.display) || !Array.isArray(value.display.views) || value.display.views.length === 0) {
    throw new SvizImportError(400, "sviz JSON must contain at least one compiled view.");
  }

  return value as SvizDisplayDocument;
}

export function getSvizAssetPath(slug: string) {
  return `hybrid-blog-app/public/demos/sviz/${validateSlug(slug)}.json`;
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function slugifySvizAsset(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "") || "demo"
  );
}

export function renderSvizMarkdownEmbed(input: {
  assetSlug: string;
  visualizationId: string;
  caption: string;
}) {
  const assetSlug = validateSlug(input.assetSlug);
  const visualizationId = escapeHtmlAttribute(input.visualizationId);
  const caption = escapeHtmlAttribute(input.caption);

  return `<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/${assetSlug}.json"
      visualization-id="${visualizationId}"
      theme="auto"
    ></systems-viz-next>
  </div>
  <figcaption>${caption}</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>`;
}

export function prepareSvizAsset(json: string, slug: string): PreparedSvizAsset {
  const document = parseSvizDisplayJson(json);
  return {
    document,
    path: getSvizAssetPath(slug),
    content: `${JSON.stringify(document, null, 2)}\n`,
  };
}
