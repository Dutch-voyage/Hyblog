import { getSecret } from "astro:env/server";

// The adapter resolves secrets from Cloudflare bindings at request time.
export function readEditorEnv(name: string) {
  return getSecret(name) ?? import.meta.env[name];
}
