#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_JSON_BYTES = 2 * 1024 * 1024;
const DEFAULT_APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  return `Import one compiled sviz display as Hyblog demo content.

Usage:
  npm run import:sviz -- --json <compiled.json> --content <slug> [options]

Required:
  --json <path>          Compiled sviz-display JSON

Options:
  --content <slug>       Content and asset slug (defaults to visualization_id)
  --title <text>         Content title (defaults to the compiled title)
  --description <text>   Content summary
  --body <text>          Introductory article text
  --caption <text>       Viewer caption
  --author <id>          Author ID (default: owner)
  --tags <a,b,c>         Comma-separated tags
  --date <YYYY-MM-DD>    Publication date (default: today)
  --status <status>      draft or published (default: draft)
  --app-dir <path>       Hyblog app directory
  --force                Replace existing matching content and JSON files
  --help                 Show this help
`;
}

function parseArgs(argv) {
  const options = {};
  const allowed = new Set([
    "json",
    "content",
    "title",
    "description",
    "body",
    "caption",
    "author",
    "tags",
    "date",
    "status",
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
    throw new Error("Content slug may contain lowercase letters, numbers, CJK characters, and hyphens only.");
  }
  return value;
}

function yamlList(values) {
  return values.map((value) => `  - ${JSON.stringify(value)}`).join("\n");
}

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMdx(input) {
  return `---
title: ${JSON.stringify(input.title)}
description: ${JSON.stringify(input.description)}
pubDate: ${input.date}
authors:
${yamlList([input.author])}
tags:
${yamlList(input.tags)}
status: ${JSON.stringify(input.status)}
formats:
${yamlList(["demo", "interactive"])}
---

import SvizEmbed from "@/components/SvizEmbed.astro";

${input.body}

<SvizEmbed
  src="/demos/sviz/${escapeAttribute(input.slug)}.json"
  visualizationId="${escapeAttribute(input.visualizationId)}"
  caption="${escapeAttribute(input.caption)}"
/>
`;
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
  const slug = validateSlug(options.content ?? slugify(document.visualization_id));
  const title = options.title ?? document.title;
  const description =
    options.description ??
    (typeof document.description === "string" && document.description.trim()
      ? document.description.trim()
      : `Interactive sviz demo: ${title}.`);
  const body = options.body ?? description;
  const caption = options.caption ?? document.title;
  const author = options.author ?? "owner";
  const tags = (options.tags ?? "demo,visualization,sviz")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const date = options.date ?? new Date().toISOString().slice(0, 10);
  const status = options.status ?? "draft";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("--date must be a valid YYYY-MM-DD date.");
  }
  if (!['draft', 'published'].includes(status)) {
    throw new Error("--status must be draft or published.");
  }
  if (!tags.length) throw new Error("--tags must contain at least one tag.");

  const componentPath = path.join(appDir, "src/components/SvizEmbed.astro");
  const runtimePath = path.join(appDir, "public/demos/sviz/systems-viz-next.js");
  if (!(await pathExists(componentPath)) || !(await pathExists(runtimePath))) {
    throw new Error("This Hyblog checkout does not include the sviz embed component and viewer runtime.");
  }

  const assetPath = path.join(appDir, "public/demos/sviz", `${slug}.json`);
  const contentPath = path.join(appDir, "src/content/demos", `${slug}.mdx`);
  const existing = [];
  if (await pathExists(assetPath)) existing.push(assetPath);
  if (await pathExists(contentPath)) existing.push(contentPath);
  if (existing.length && !options.force) {
    throw new Error(`Refusing to replace existing files:\n${existing.map((value) => `  ${value}`).join("\n")}\nPass --force to replace them.`);
  }

  await mkdir(path.dirname(assetPath), { recursive: true });
  await mkdir(path.dirname(contentPath), { recursive: true });
  await writeFile(assetPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  await writeFile(
    contentPath,
    renderMdx({
      author,
      body,
      caption,
      date,
      description,
      slug,
      status,
      tags,
      title,
      visualizationId: document.visualization_id,
    }),
    "utf8",
  );

  process.stdout.write(`Imported sviz demo ${document.visualization_id}\n`);
  process.stdout.write(`  content: ${path.relative(process.cwd(), contentPath)}\n`);
  process.stdout.write(`  asset:   ${path.relative(process.cwd(), assetPath)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
