export function figureMarkdown(src: string, caption: string, previewSrc?: string) {
  if (!/^\/figures\/[a-z0-9\u4e00-\u9fa5-]+\.(png|jpe?g|pdf)$/.test(src)) {
    throw new Error("Invalid figure URL.");
  }
  const label = (caption.trim() || "Figure").replace(/[\r\n]+/g, " ").replace(/[\\`*_{}\[\]()<>!|]/g, "\\$&");
  const url = encodeURI(src);
  if (previewSrc) {
    if (!src.endsWith(".pdf") || !/^\/figures\/[a-z0-9\u4e00-\u9fa5-]+\.png$/.test(previewSrc)) throw new Error("Invalid PDF preview URL.");
    return `[![${label}](${encodeURI(previewSrc)})](${url})`;
  }
  return src.endsWith(".pdf") ? `[${label} (PDF)](${url})` : `![${label}](${url})`;
}
