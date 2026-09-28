// Local-only review export: never changes publication status or public routes.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
marked.use(markedKatex({ throwOnError: true, trust: false }));
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, '../work/chunk-scheduler-update');
const katexRoot = resolve(root, 'node_modules/katex/dist');
const katexCss = readFileSync(resolve(katexRoot, 'katex.min.css'), 'utf8').replace(/url\(([^)]+)\)/g, (_, file) => {
  const name = file.replace(/["']/g, '');
  const ext = name.split('.').pop();
  return `url(data:font/${ext};base64,${readFileSync(resolve(katexRoot, name)).toString('base64')})`;
});
mkdirSync(out, { recursive: true });
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const local = url => {
  const path = resolve(root, 'public', url.replace(/^\//, ''));
  if (!path.startsWith(resolve(root, 'public') + '/')) throw new Error('Outside public assets');
  return path;
};
const raw = readFileSync(resolve(root, 'src/content/posts/rollout-scheduler-5.md'), 'utf8');
let body = marked.parse(raw.replace(/^---\n[\s\S]*?\n---\n/, ''));
body = body.replace(/<img([^>]*?)src="(\/[^\"]+)"([^>]*?)>/g, (_, before, url, after) => {
  const mime = url.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  return `<img${before}src="data:${mime};base64,${readFileSync(local(url)).toString('base64')}"${after}>`;
});
// Keep report tabs inside srcdoc instead of resolving hashes against the parent page.
const fragmentNavigation = `<script>document.addEventListener('click', event => { const link = event.target.closest('a[href^="#"]'); if (link && link.getAttribute('href').length > 1) { event.preventDefault(); location.hash = link.getAttribute('href'); } });</script>`;
body = body.replace(/<iframe([^>]*?)src="(\/[^\"]+)"([^>]*?)><\/iframe>/g, (_, before, url, after) => `<iframe${before}srcdoc="${escape(readFileSync(local(url), 'utf8').replace('</body>', fragmentNavigation + '</body>'))}"${after}></iframe>`);
body = body.replace(/href="(\/demos\/[^"#]+)(#[^"]*)?"/g, (_, url, hash = '') => `href="${relative(out, local(url))}${hash}"`);
writeFileSync(resolve(out, 'rollout-scheduler-5-review.html'), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rollout Scheduler (5)</title><style>${katexCss} .katex-display{overflow-x:auto;overflow-y:hidden;padding:8px 0;}
*{box-sizing:border-box}body{margin:auto;max-width:1320px;padding:32px 24px 80px;font:17px/1.85 system-ui,sans-serif;color:#182738;background:#fafbfc}h1{font-size:32px}h4{font-size:25px;margin-top:2.6em}p{max-width:900px}table{border-collapse:collapse;width:100%;font-size:15px;display:block;overflow:auto}td,th{border:1px solid #c9d4df;padding:10px 14px;text-align:left}th{background:#eaf0f6}pre{padding:18px;background:#edf2f7;overflow:auto;font:15px/1.7 ui-monospace,monospace}img{max-width:100%;height:auto}figure{margin:24px 0}figcaption{font-size:14px;color:#526477}iframe{width:100%;height:840px;border:1px solid #c9d4df;border-radius:12px}.badge{background:#fff0c4;padding:12px 18px;border-radius:8px}a{color:#1658a1}@media(max-width:600px){body{padding:18px 14px}h1{font-size:27px}iframe{height:940px}}
</style><body><h1>Rollout Scheduler (5)</h1>${body}</body></html>`);
console.log(resolve(out, 'rollout-scheduler-5-review.html'));
