import { defineConfig } from "astro/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Astro 6 builds in the Workers runtime; Pages rejects its generated ASSETS binding
// if pages_build_output_dir is carried into that runtime configuration. Derive the
// build/dev config from Pages so bindings stay in one source of truth.
const pagesConfig = parse(readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8"));
const { pages_build_output_dir, ...workerConfig } = pagesConfig;
const runtimeConfig = new URL("./.astro/wrangler.json", import.meta.url);
mkdirSync(new URL("./.astro/", import.meta.url), { recursive: true });
const runtimeConfigText = JSON.stringify(workerConfig, null, 2);
if (!existsSync(runtimeConfig) || readFileSync(runtimeConfig, "utf8") !== runtimeConfigText) {
  writeFileSync(runtimeConfig, runtimeConfigText);
}

export default defineConfig({
  site: "https://example.com",
  output: "static",
  adapter: cloudflare({ configPath: fileURLToPath(runtimeConfig) }),
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { trust: false }]],
  },
  integrations: [{
    name: "separate-vite-command-caches",
    hooks: {
      "astro:config:setup": ({ command, updateConfig }) => {
        // Cloudflare optimizes different server modules for dev, sync/check, and
        // build. Sharing a cache lets those commands delete a running dev server's
        // modules. Keep each command's optimized dependencies independent.
        updateConfig({
          vite: { cacheDir: fileURLToPath(new URL(`./node_modules/.vite/${command}/`, import.meta.url)) },
        });
      },
    },
  }, mdx(), sitemap({ filter: (page) => !/^\/(editor|drafts|login)(\/|$)/.test(new URL(page).pathname) })],
});
