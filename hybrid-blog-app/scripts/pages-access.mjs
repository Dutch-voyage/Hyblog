export function isServerAssetRequest(requestUrl) {
  try {
    const decoded = decodeURIComponent(new URL(requestUrl).pathname);
    const normalized = decoded.replaceAll("\\", "/").replace(/\/+/g, "/");
    const pathname = new URL(normalized, "https://pages.internal").pathname;
    return pathname === "/_worker.js" || pathname.startsWith("/_worker.js/");
  } catch {
    return true;
  }
}
