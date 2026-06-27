import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  output: "server",
  adapter: cloudflare(),
  integrations: [mdx(), sitemap()],
});
