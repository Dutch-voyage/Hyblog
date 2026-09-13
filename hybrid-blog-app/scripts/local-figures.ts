import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { EditorContentError } from "../src/lib/editor/content";

const run = promisify(execFile);

async function renderPdfPreview(file: string) {
  const temporary = await mkdtemp(path.join(tmpdir(), "hyblog-pdf-preview-"));
  try {
    const prefix = path.join(temporary, "page");
    await run("pdftoppm", ["-f", "1", "-l", "1", "-singlefile", "-scale-to", "2400", "-png", file, prefix], {
      timeout: 30000, maxBuffer: 1024 * 1024,
    });
    return await readFile(`${prefix}.png`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new EditorContentError(503, "PDF previews require Poppler. Install it with brew install poppler, then restart the local server.");
    }
    throw new EditorContentError(400, "Unable to render the PDF's first page. Check that it is a valid, unencrypted PDF.");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function saveLocalFigure(appRoot: string, name: string, bytes: Buffer) {
  const extension = path.extname(name).toLowerCase();
  const signatures: Record<string, Buffer> = {
    ".png": Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    ".jpg": Buffer.from([255, 216, 255]),
    ".jpeg": Buffer.from([255, 216, 255]),
    ".pdf": Buffer.from("%PDF-"),
  };
  const signature = signatures[extension];
  if (!signature || !bytes.subarray(0, signature.length).equals(signature)) {
    throw new EditorContentError(400, "Choose a valid PNG, JPEG, or PDF file matching its extension.");
  }
  const slug = path.basename(name, path.extname(name)).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "figure";
  const digest = createHash("sha256").update(bytes).digest("hex");
  const filename = `${slug}-${digest.slice(0, 16)}${extension}`;
  const publicDir = path.join(appRoot, "public");
  const directory = path.join(publicDir, "figures");
  for (const folder of [publicDir, directory]) {
    await mkdir(folder, { recursive: true });
    if ((await lstat(folder)).isSymbolicLink()) throw new EditorContentError(403, "Figure directories must not be symlinks.");
  }
  const file = path.join(directory, filename);
  try {
    await writeFile(file, bytes, { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    if (!(await lstat(file)).isFile() || (await lstat(file)).isSymbolicLink() || !(await readFile(file)).equals(bytes)) {
      throw new EditorContentError(409, "A different asset exists at this path.");
    }
  }
  let previewSrc: string | undefined;
  if (extension === ".pdf") {
    const previewName = `${slug}-${digest.slice(0, 16)}-page-1.png`;
    const previewPath = path.join(directory, previewName);
    try {
      const stat = await lstat(previewPath);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new EditorContentError(409, "Invalid PDF preview asset.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const png = await renderPdfPreview(file);
      try { await writeFile(previewPath, png, { flag: "wx" }); } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
    }
    previewSrc = `/figures/${previewName}`;
  }
  return { previewSrc, src: `/figures/${filename}`, path: `public/figures/${filename}`, kind: extension === ".pdf" ? "pdf" : "image" };
}
