export const editorCollections = ["posts", "notes", "demos"] as const;

export type EditorCollection = (typeof editorCollections)[number];
export type ProposalIntent = "draft" | "publish";

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface PreparedEditorContent {
  collection: EditorCollection;
  slug: string;
  path: string;
  extension: "md" | "mdx";
  markdown: string;
  title: string;
  status: "draft" | "published";
}

export class EditorContentError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "EditorContentError";
    this.status = status;
  }
}

const slugPattern = /^[a-z0-9\u4e00-\u9fa5][a-z0-9\u4e00-\u9fa5-]*$/;

export function isEditorCollection(value: string): value is EditorCollection {
  return (editorCollections as readonly string[]).includes(value);
}

export function getCollectionExtension(collection: EditorCollection) {
  return collection === "demos" ? "mdx" : "md";
}

export function getEditorContentPath(collection: EditorCollection, slug: string) {
  return `hybrid-blog-app/src/content/${collection}/${slug}.${getCollectionExtension(collection)}`;
}

export function slugifyTitle(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled";
}

export function validateSlug(slug: string) {
  if (!slugPattern.test(slug)) {
    throw new EditorContentError(
      400,
      "Use a slug with lowercase letters, numbers, hyphens, or CJK characters only.",
    );
  }

  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    throw new EditorContentError(400, "Slug cannot contain path separators.");
  }

  return slug;
}

function parseYamlScalar(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  return trimmed;
}

export function parseMarkdown(markdown: string): ParsedMarkdown {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) {
    throw new EditorContentError(400, "Markdown must start with YAML frontmatter.");
  }

  const frontmatter: Record<string, unknown> = {};
  const lines = match[1].split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/);
    if (!keyMatch) {
      throw new EditorContentError(400, `Unsupported frontmatter line: ${line}`);
    }

    const key = keyMatch[1];
    const rawValue = keyMatch[2] ?? "";

    if (rawValue.trim() !== "") {
      frontmatter[key] = parseYamlScalar(rawValue);
      continue;
    }

    const list: string[] = [];
    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1];
      const itemMatch = nextLine.match(/^\s+-\s*(.*)$/);
      if (!itemMatch) break;
      list.push(String(parseYamlScalar(itemMatch[1])));
      index += 1;
    }

    frontmatter[key] = list;
  }

  return {
    frontmatter,
    body: match[2] ?? "",
  };
}

function ensureString(frontmatter: Record<string, unknown>, key: string) {
  const value = frontmatter[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new EditorContentError(400, `Frontmatter field "${key}" is required.`);
  }
  return value.trim();
}

function ensureDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new EditorContentError(400, "pubDate must be a valid YYYY-MM-DD date.");
  }
}

function ensureStringList(frontmatter: Record<string, unknown>, key: string) {
  const value = frontmatter[key];
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new EditorContentError(400, `Frontmatter field "${key}" must be a string list.`);
  }
}

function ensureOptionalUrl(frontmatter: Record<string, unknown>, key: string) {
  const value = frontmatter[key];
  if (value === undefined || value === "") return;
  if (typeof value !== "string") {
    throw new EditorContentError(400, `Frontmatter field "${key}" must be a URL string.`);
  }

  try {
    new URL(value);
  } catch {
    throw new EditorContentError(400, `Frontmatter field "${key}" must be a valid URL.`);
  }
}

export function setMarkdownStatus(markdown: string, status: "draft" | "published") {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    throw new EditorContentError(400, "Markdown must start with YAML frontmatter.");
  }

  const frontmatter = frontmatterMatch[1] ?? "";
  const nextFrontmatter = /^status:\s*.*$/m.test(frontmatter)
    ? frontmatter.replace(/^status:\s*.*$/m, `status: "${status}"`)
    : `${frontmatter.trimEnd()}\nstatus: "${status}"`;

  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${nextFrontmatter.trim()}\n---`);
}

export function prepareEditorContent(input: {
  collection: string;
  slug?: string | null;
  markdown: string;
  intent: ProposalIntent;
}): PreparedEditorContent {
  if (!isEditorCollection(input.collection)) {
    throw new EditorContentError(400, "Unsupported content collection.");
  }

  const intendedStatus = input.intent === "publish" ? "published" : "draft";
  const markdown = setMarkdownStatus(input.markdown, intendedStatus);
  const parsed = parseMarkdown(markdown);
  const title = ensureString(parsed.frontmatter, "title");
  ensureString(parsed.frontmatter, "description");
  ensureDate(ensureString(parsed.frontmatter, "pubDate"));
  ensureStringList(parsed.frontmatter, "authors");
  ensureStringList(parsed.frontmatter, "tags");
  ensureStringList(parsed.frontmatter, "formats");
  ensureOptionalUrl(parsed.frontmatter, "canonicalUrl");

  if (input.collection === "demos") {
    ensureOptionalUrl(parsed.frontmatter, "demoUrl");
    ensureOptionalUrl(parsed.frontmatter, "repositoryUrl");
  }

  const status = parsed.frontmatter.status;
  if (status !== "draft" && status !== "published") {
    throw new EditorContentError(400, 'Frontmatter field "status" must be draft or published.');
  }

  const slug = validateSlug(input.slug?.trim() || slugifyTitle(title));
  const extension = getCollectionExtension(input.collection);

  return {
    collection: input.collection,
    slug,
    path: getEditorContentPath(input.collection, slug),
    extension,
    markdown,
    title,
    status,
  };
}

