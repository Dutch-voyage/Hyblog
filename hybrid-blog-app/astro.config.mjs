import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://example.com",
  output: "static",
  adapter: cloudflare(),
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { trust: false }]],
  },
  integrations: [mdx(), sitemap({ filter: (page) => !/^\/(editor|drafts|login)(\/|$)/.test(new URL(page).pathname) })],
});
