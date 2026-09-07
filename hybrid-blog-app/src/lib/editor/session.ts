import { readEditorEnv } from "./env";

export const editorSessionCookie = "hyblog_editor_session";
export const oauthStateCookie = "hyblog_oauth_state";
export const editorSessionMaxAge = 60 * 60 * 24 * 7;

export interface EditorSession {
  token: string;
  login: string;
  userId: number;
  avatarUrl?: string;
  csrfToken: string;
  createdAt: string;
}

export interface CookieWriter {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: Record<string, unknown>): void;
  delete(name: string, options?: Record<string, unknown>): void;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is not available in this runtime.");
  }

  return globalThis.crypto;
}

function encode(value: Uint8Array) {
  let binary = "";
  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function decode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodeBase64UrlText(value: string) {
  return encode(encoder.encode(value));
}

export function decodeBase64UrlText(value: string) {
  return decoder.decode(decode(value));
}

async function getSessionKey(secret: string) {
  const digest = await getCrypto().subtle.digest("SHA-256", encoder.encode(secret));
  return getCrypto().subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export function getRequiredSessionSecret() {
  const secret = readEditorEnv("SESSION_SECRET");
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

export async function sealSession(session: EditorSession, secret: string) {
  const iv = getCrypto().getRandomValues(new Uint8Array(12));
  const ciphertext = await getCrypto().subtle.encrypt(
    { name: "AES-GCM", iv },
    await getSessionKey(secret),
    encoder.encode(JSON.stringify({ version: 2, session })),
  );

  return [encode(iv), encode(new Uint8Array(ciphertext))].join(".");
}

export async function unsealSession(value: string, secret: string): Promise<EditorSession | null> {
  const [ivValue, ciphertextValue] = value.split(".");
  if (!ivValue || !ciphertextValue) return null;

  try {
    const plaintext = await getCrypto().subtle.decrypt(
      { name: "AES-GCM", iv: decode(ivValue) },
      await getSessionKey(secret),
      decode(ciphertextValue),
    );
    const parsed = JSON.parse(decoder.decode(plaintext)) as { version: 2; session: EditorSession };
    if (parsed.version !== 2 || !parsed.session?.token || !parsed.session.login) return null;
    const createdAt = Date.parse(parsed.session.createdAt);
    const age = Date.now() - createdAt;
    if (!Number.isFinite(createdAt) || age < 0 || age >= editorSessionMaxAge * 1000) return null;
    return parsed.session;
  } catch {
    return null;
  }
}

export function createOAuthState() {
  return encode(getCrypto().getRandomValues(new Uint8Array(32)));
}

export function createCsrfToken() {
  return encode(getCrypto().getRandomValues(new Uint8Array(32)));
}

export function verifyToken(a: string, b: string) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
}

export function getCookieOptions(url: URL, maxAge?: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: url.protocol === "https:",
    ...(maxAge ? { maxAge } : {}),
  } as const;
}

export async function setEditorSessionCookie(cookies: CookieWriter, url: URL, session: EditorSession) {
  const sealed = await sealSession(session, getRequiredSessionSecret());
  cookies.set(editorSessionCookie, sealed, getCookieOptions(url, editorSessionMaxAge));
}

export async function readEditorSession(cookies: CookieWriter) {
  const value = cookies.get(editorSessionCookie)?.value;
  if (!value) return null;
  return unsealSession(value, getRequiredSessionSecret());
}

export function clearEditorSessionCookie(cookies: CookieWriter, url: URL) {
  cookies.delete(editorSessionCookie, getCookieOptions(url));
}

export function setOAuthStateCookie(cookies: CookieWriter, url: URL, state: string) {
  cookies.set(oauthStateCookie, state, getCookieOptions(url, 60 * 10));
}

export function readOAuthStateCookie(cookies: CookieWriter) {
  return cookies.get(oauthStateCookie)?.value ?? null;
}

export function clearOAuthStateCookie(cookies: CookieWriter, url: URL) {
  cookies.delete(oauthStateCookie, getCookieOptions(url));
}

export function sanitizeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/editor/";
  // Backslashes and control characters are normalized by browsers when redirecting.
  if (/[\\\u0000-\u001f\u007f]/u.test(value)) return "/editor/";
  return value;
}
