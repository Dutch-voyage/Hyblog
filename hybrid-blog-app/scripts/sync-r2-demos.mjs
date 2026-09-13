#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { parse } from "smol-toml";
import { parseDisplayJson } from "./import-sviz-demo.mjs";

const app = fileURLToPath(new URL("../", import.meta.url));
const configPath = path.resolve(app, "../wrangler.toml");
const production = "https://hyblog.me";
const local = "http://localhost:4321";
const digest = bytes => createHash("sha256").update(bytes).digest("hex");

export function demoReferences(markdown) {
  return [...new Set(markdown.match(/\/demos\/r2\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[a-z0-9\u4e00-\u9fa5][a-z0-9\u4e00-\u9fa5-]*\.json/g) ?? [])];
}

async function contentReferences(dir) {
  const refs = new Set();
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const ref of await contentReferences(filename)) refs.add(ref);
    } else if (/\.mdx?$/.test(entry.name)) {
      for (const ref of demoReferences(await readFile(filename, "utf8"))) refs.add(ref);
    }
  }
  return refs;
}

function requireJson(response, url) {
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`${url}: expected demo JSON, received HTTP ${response.status} (${response.headers.get("content-type")}).`);
  }
}

// Dependency injection keeps tests off the production bucket.
/**
 * @param {Iterable<string>} refs
 * @param {{check?: boolean, fetcher?: typeof fetch, upload?: (key: string, bytes: Buffer) => Promise<void>, log?: (message: string) => void}} options
 */
export async function syncDemos(refs, { check = false, fetcher = fetch, upload, log = console.log } = {}) {
  const missing = [];
  for (const ref of refs) {
    const remoteUrl = production + ref;
    const response = await fetcher(remoteUrl, { method: "HEAD", signal: AbortSignal.timeout(30000) });
    if (response.status !== 404) {
      requireJson(response, remoteUrl);
      log(`Available: ${ref}`);
      continue;
    }
    if (check) { missing.push(ref); continue; }
    const localResponse = await fetcher(local + ref, { signal: AbortSignal.timeout(120000) });
    requireJson(localResponse, local + ref);
    const bytes = Buffer.from(await localResponse.arrayBuffer());
    parseDisplayJson(bytes.toString("utf8"));
    const key = `sviz/${ref.slice("/demos/r2/".length)}`;
    if (!upload) throw new Error("No R2 uploader configured.");
    await upload(key, bytes);
    // Read the public route, not just the CLI's success message.
    const verified = await fetcher(remoteUrl, { signal: AbortSignal.timeout(120000), cache: "no-store" });
    requireJson(verified, remoteUrl);
    if (digest(Buffer.from(await verified.arrayBuffer())) !== digest(bytes)) {
      throw new Error(`Uploaded demo failed SHA-256 verification: ${ref}`);
    }
    log(`Uploaded and verified ${bytes.length} bytes: ${ref}`);
  }
  if (missing.length) {
    throw new Error(`Production R2 is missing ${missing.length} referenced demo(s):\n${missing.join("\n")}\nStart the local dev server and run npm run sync:demos on the machine holding these uploads, then retry deployment.`);
  }
}

async function uploadWithWrangler(key, bytes) {
  const config = parse(await readFile(configPath, "utf8"));
  const bucket = config.r2_buckets?.find(binding => binding.binding === "DEMOS_BUCKET")?.bucket_name;
  if (!bucket) throw new Error("DEMOS_BUCKET is missing from wrangler.toml.");
  const temp = await mkdtemp(path.join(tmpdir(), "hyblog-r2-"));
  try {
    const filename = path.join(temp, "demo.json");
    await writeFile(filename, bytes, { mode: 0o600 });
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [path.join(app, "node_modules/wrangler/bin/wrangler.js"),
        "r2", "object", "put", `${bucket}/${key}`, "--remote", "--config", configPath,
        "--file", filename, "--content-type", "application/json; charset=utf-8"], { stdio: "inherit" });
      child.on("error", reject);
      child.on("exit", code => code === 0 ? resolve() : reject(new Error(`R2 upload failed (${code}). Run Wrangler login and retry.`)));
    });
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.slice(2).some(arg => arg !== "--check")) throw new Error("Usage: npm run sync:demos [-- --check]");
    await syncDemos(await contentReferences(path.join(app, "src/content")), {
      check: process.argv.includes("--check"), upload: uploadWithWrangler,
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
