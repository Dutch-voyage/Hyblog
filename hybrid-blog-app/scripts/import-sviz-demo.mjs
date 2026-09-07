#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_JSON_BYTES = 2 * 1024 * 1024;
const DEFAULT_APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  return `Import one compiled sviz display as a Hyblog asset.

Usage:
  npm run import:sviz -- --json <compiled.json> [options]

Required:
  --json <path>          Compiled sviz-display JSON

Options:
  --asset <slug>         Asset slug (defaults to visualization_id)
  --content <slug>       Deprecated alias for --asset
  --caption <text>       Viewer caption
  --app-dir <path>       Hyblog app directory
  --force                Replace an existing matching JSON asset
  --help                 Show this help
`;
}

function parseArgs(argv) {
  const options = {};
  const allowed = new Set([
    "json",
    "asset",
    "content",
    "caption",
    "app-dir",
    "force",
    "help",
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) throw new Error(`Unexpected argument: ${argument}`);
    const equalsIndex = argument.indexOf("=");
    const rawKey = argument.slice(2, equalsIndex === -1 ? undefined : equalsIndex);
    const inlineValue = equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1);
    if (!allowed.has(rawKey)) throw new Error(`Unknown option: --${rawKey}`);
    if (rawKey === "force" || rawKey === "help") {
      options[rawKey] = true;
      continue;
    }
    const value = inlineValue ?? argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`--${rawKey} requires a value.`);
    options[rawKey] = value;
  }
  return options;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseDisplayJson(source) {
  if (Buffer.byteLength(source, "utf8") > MAX_JSON_BYTES) {
    throw new Error("sviz JSON must be 2 MiB or smaller.");
  }

  let document;
  try {
    document = JSON.parse(source);
  } catch {
    throw new Error("The input file is not valid JSON.");
  }

  if (!isRecord(document)) throw new Error("The JSON root must be an object.");
  if (document.format !== "sviz-display" || document.format_version !== "0.2-draft") {
    throw new Error("The current viewer requires sviz-display 0.2-draft.");
  }
  if (typeof document.visualization_id !== "string" || !document.visualization_id.trim()) {
    throw new Error('sviz field "visualization_id" must be a non-empty string.');
  }
  if (typeof document.title !== "string" || !document.title.trim()) {
    throw new Error('sviz field "title" must be a non-empty string.');
  }
  if (!isRecord(document.execution) || !Array.isArray(document.execution.checkpoints) || !document.execution.checkpoints.length) {
    throw new Error("sviz JSON must contain at least one compiled checkpoint.");
  }
  if (!isRecord(document.display) || !Array.isArray(document.display.views) || !document.display.views.length) {
    throw new Error("sviz JSON must contain at least one compiled view.");
  }
  return document;
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateSlug(value) {
  if (!/^[a-z0-9\u4e00-\u9fa5][a-z0-9\u4e00-\u9fa5-]*$/.test(value)) {
    throw new Error("Asset slug may contain lowercase letters, numbers, CJK characters, and hyphens only.");
  }
  return value;
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMarkdownEmbed(input) {
  return `<figure class="sviz-demo">
  <div class="sviz-demo-frame">
    <systems-viz-next
      src="/demos/sviz/${escapeAttribute(input.slug)}.json"
      visualization-id="${escapeAttribute(input.visualizationId)}"
      theme="auto"
      style="--sv-bg: var(--background); --sv-panel: var(--surface); --sv-panel-soft: color-mix(in srgb, var(--surface) 68%, var(--accent-soft)); --sv-text: var(--text); --sv-muted: var(--muted); --sv-border: var(--border); --sv-primary: var(--accent); --sv-selection: var(--accent);"
    ></systems-viz-next>
  </div>
  <figcaption>${escapeAttribute(input.caption)}</figcaption>
</figure>
<script type="module" src="/demos/sviz/systems-viz-next.js"></script>`;
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage());
    return;
  }
  if (!options.json) throw new Error("--json is required.\n\n" + usage());

  const appDir = path.resolve(options["app-dir"] ?? DEFAULT_APP_DIR);
  const packageJson = JSON.parse(await readFile(path.join(appDir, "package.json"), "utf8"));
  if (packageJson.name !== "hybrid-blog") {
    throw new Error(`--app-dir is not a Hyblog app directory: ${appDir}`);
  }

  const jsonPath = path.resolve(options.json);
  const source = await readFile(jsonPath, "utf8");
  const document = parseDisplayJson(source);
  const slug = validateSlug(options.asset ?? options.content ?? slugify(document.visualization_id));
  const caption = options.caption ?? document.title;

  const runtimePath = path.join(appDir, "public/demos/sviz/systems-viz-next.js");
  if (!(await pathExists(runtimePath))) {
    throw new Error("This Hyblog checkout does not include the sviz viewer runtime.");
  }

  const assetPath = path.join(appDir, "public/demos/sviz", `${slug}.json`);
  if ((await pathExists(assetPath)) && !options.force) {
    throw new Error(`Refusing to replace existing asset:\n  ${assetPath}\nPass --force to replace it.`);
  }

  await mkdir(path.dirname(assetPath), { recursive: true });
  await writeFile(assetPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

  process.stdout.write(`Imported sviz asset ${document.visualization_id}\n`);
  process.stdout.write(`  asset: ${path.relative(process.cwd(), assetPath)}\n\n`);
  process.stdout.write("Copy this into any Markdown content:\n\n");
  process.stdout.write(`${renderMarkdownEmbed({
    caption,
    slug,
    visualizationId: document.visualization_id,
  })}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
