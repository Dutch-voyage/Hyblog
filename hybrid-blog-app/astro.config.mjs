import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [mdx(), sitemap()],
});
