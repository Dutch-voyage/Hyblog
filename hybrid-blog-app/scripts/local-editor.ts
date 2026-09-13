import { createHash, randomUUID } from "node:crypto";
import { lstat, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { saveLocalFigure } from "./local-figures";
import type { Plugin } from "vite";
import { EditorContentError, isEditorCollection, parseMarkdown, prepareEditorContent, validateSlug } from "../src/lib/editor/content";

const revision = (text: string) => createHash("sha256").update(text).digest("hex");

export function localEditorPlugin(appRoot: string): Plugin {
  const token = randomUUID();
  let writes = Promise.resolve();
  return {
    name: "local-editor-files",
    apply: "serve",
    configureServer(server) {
      // This Node middleware exists only in astro dev, never in the deployed Worker.
      server.middlewares.use(async (req, res, next) => {
        // Cloudflare's dev asset manifest can lag behind newly uploaded files.
        // Serve local figures immediately; production serves them from public/.
        if (req.url?.startsWith("/figures/") && (req.method === "GET" || req.method === "HEAD")) {
          try {
            const name = decodeURIComponent(new URL(req.url, "http://localhost").pathname).slice("/figures/".length);
            if (!/^[a-z0-9\u4e00-\u9fa5-]+\.(png|jpe?g|pdf)$/.test(name)) return next();
            const directory = path.join(appRoot, "public/figures");
            const file = path.join(directory, name);
            if ((await lstat(directory)).isSymbolicLink() || (await lstat(file)).isSymbolicLink()) return next();
            const bytes = await readFile(file);
            const type = name.endsWith(".pdf") ? "application/pdf" : name.endsWith(".png") ? "image/png" : "image/jpeg";
            res.writeHead(200, { "Content-Type": type, "Content-Length": bytes.length, "X-Content-Type-Options": "nosniff" });
            res.end(req.method === "HEAD" ? undefined : bytes);
            return;
          } catch { return next(); }
        }
        if (!req.url?.startsWith("/__local-editor/")) return next();
        const reply = (status: number, body: unknown) => {
          res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
          res.end(JSON.stringify(body));
        };
        const url = new URL(req.url, `http://${req.headers.host}`);
        const loopback = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
        if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
            !loopback.includes(req.socket.remoteAddress ?? "") ||
            req.headers["sec-fetch-site"] === "cross-site" ||
            (req.headers.origin && req.headers.origin !== url.origin)) {
          return reply(403, { error: "Local editor requests must come from this local site." });
        }
        if (req.method === "GET" && url.pathname === "/__local-editor/session") {
          return reply(200, { enabled: true, token });
        }
        if (!["/__local-editor/content", "/__local-editor/figures"].includes(url.pathname)) return reply(404, { error: "Not found." });
        if (req.headers["x-local-editor-token"] !== token) return reply(403, { error: "Invalid local editor token. Reload the editor." });
        if (req.method !== "GET" && req.method !== "POST") return reply(405, { error: "Method not allowed." });
        try {
          if (url.pathname === "/__local-editor/figures") {
            if (req.method !== "POST") return reply(405, { error: "Method not allowed." });
            if (req.headers.origin !== url.origin) return reply(403, { error: "A same-origin upload is required." });
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            return reply(201, await saveLocalFigure(appRoot, url.searchParams.get("name") ?? "", Buffer.concat(chunks)));
          }
          const collection = url.searchParams.get("collection") ?? "";
          const slug = validateSlug(url.searchParams.get("slug") ?? "");
          if (!isEditorCollection(collection)) throw new EditorContentError(400, "Unsupported content collection.");
          const directory = path.join(appRoot, "src/content", collection);
          if ((await lstat(directory)).isSymbolicLink()) throw new EditorContentError(403, "Content directories must not be symlinks.");
          let file = path.join(directory, `${slug}.md`);
          async function readCurrent() {
            for (const extension of ["md", "mdx"]) {
              const candidate = path.join(directory, `${slug}.${extension}`);
              try {
                const stat = await lstat(candidate);
                if (!stat.isFile() || stat.isSymbolicLink()) throw new EditorContentError(403, "Content must be a regular file.");
                file = candidate;
                return await readFile(file, "utf8");
              } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
              }
            }
            return null;
          }
          const result = (markdown: string) => ({ collection, slug, path: path.relative(appRoot, file), markdown, revision: revision(markdown) });
          if (req.method === "GET") {
            const markdown = await readCurrent();
            return markdown === null ? reply(404, { error: "Local content file not found." }) : reply(200, result(markdown));
          }
          if (req.headers.origin !== url.origin) return reply(403, { error: "A same-origin save is required." });
          let size = 0;
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 8 * 1024 * 1024) throw new EditorContentError(413, "Markdown must be 8 MiB or smaller.");
            chunks.push(Buffer.from(chunk));
          }
          let body: { markdown: string; revision: string | null };
          try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch {
            throw new EditorContentError(400, "Expected JSON request body.");
          }
          if (!body || typeof body.markdown !== "string" || (body.revision !== null && typeof body.revision !== "string")) {
            throw new EditorContentError(400, "Markdown and its previous revision are required.");
          }
          const status = parseMarkdown(body.markdown).frontmatter.status;
          if (!["draft", "staged", "published"].includes(String(status))) throw new EditorContentError(400, "Invalid content status.");
          prepareEditorContent({ collection, slug, markdown: body.markdown, intent: status === "published" ? "publish" : status === "staged" ? "stage" : "draft" });
          // Serialize compare-and-write operations so concurrent tabs cannot silently overwrite.
          const save = writes.then(async () => {
            const current = await readCurrent();
            if ((current === null ? null : revision(current)) !== body.revision) {
              throw new EditorContentError(409, "The local file changed. Reload it before saving; your editor text has been kept.");
            }
            const temporary = `${file}.${randomUUID()}.tmp`;
            try {
              await writeFile(temporary, body.markdown, { flag: "wx" });
              await rename(temporary, file);
            } finally {
              await unlink(temporary).catch(() => {});
            }
            return result(body.markdown);
          });
          writes = save.then(() => {}, () => {});
          return reply(200, await save);
        } catch (error) {
          return reply(error instanceof EditorContentError ? error.status : 500, {
            error: error instanceof EditorContentError ? error.message : "Unable to access the local content file.",
          });
        }
      });
    },
  };
}
