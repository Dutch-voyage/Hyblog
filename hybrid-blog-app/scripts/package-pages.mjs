import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const client = new URL("../dist/client/", import.meta.url);
const server = new URL("../dist/server/", import.meta.url);
const output = new URL("../../dist/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(client, output, { recursive: true });
// Pages advanced mode executes this directory; it must never be a public asset.
const worker = new URL("_worker.js/", output);
await cp(server, worker, { recursive: true });
await cp(new URL("pages-access.mjs", import.meta.url), new URL("pages-access.mjs", worker));
await writeFile(new URL("index.js", worker), `import worker from "./entry.mjs";
import { isServerAssetRequest } from "./pages-access.mjs";

export default {
  fetch(request, env, context) {
    // Pages' local asset server can expose files inside this directory.
    // Block access before Astro can fall back to the ASSETS binding.
    if (isServerAssetRequest(request.url)) {
      return new Response("Not found", { status: 404 });
    }
    return worker.fetch(request, env, context);
  },
};
`);
await rm(new URL("wrangler.json", worker), { force: true });
await writeFile(new URL("_routes.json", output), JSON.stringify({
  version: 1,
  include: ["/*"],
  // All requests pass the source-file guard, including encoded asset paths.
  exclude: [],
}, null, 2));
console.log("Packaged static assets and the authenticated server for Cloudflare Pages.");
