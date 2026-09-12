import { Marked } from "marked";
import markedKatex from "marked-katex-extension";

// Callers must sanitize the rendered HTML before inserting it into the DOM.
export const previewMarkdown = new Marked({ gfm: true, breaks: false });
previewMarkdown.use(markedKatex({ throwOnError: false, trust: false }));
