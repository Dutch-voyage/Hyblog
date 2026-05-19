import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const editorSessionCookie = "hyblog_editor_session";
export const oauthStateCookie = "hyblog_oauth_state";

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

function getSessionKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

export function getRequiredSessionSecret() {
  const secret = import.meta.env.SESSION_SECRET ?? process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

export function sealSession(session: EditorSession, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getSessionKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify({ version: 1, session }), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [encode(iv), encode(tag), encode(ciphertext)].join(".");
}

export function unsealSession(value: string, secret: string): EditorSession | null {
  const [ivValue, tagValue, ciphertextValue] = value.split(".");
  if (!ivValue || !tagValue || !ciphertextValue) return null;

  try {
    const decipher = createDecipheriv("aes-256-gcm", getSessionKey(secret), decode(ivValue));
    decipher.setAuthTag(decode(tagValue));
    const plaintext = Buffer.concat([
      decipher.update(decode(ciphertextValue)),
      decipher.final(),
    ]).toString("utf8");
    const parsed = JSON.parse(plaintext) as { version: 1; session: EditorSession };
    if (parsed.version !== 1 || !parsed.session?.token || !parsed.session.login) return null;
    return parsed.session;
  } catch {
    return null;
  }
}

export function createOAuthState() {
  return encode(randomBytes(32));
}

export function createCsrfToken() {
  return encode(randomBytes(32));
}

export function verifyToken(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
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

export function setEditorSessionCookie(cookies: CookieWriter, url: URL, session: EditorSession) {
  const sealed = sealSession(session, getRequiredSessionSecret());
  cookies.set(editorSessionCookie, sealed, getCookieOptions(url, 60 * 60 * 24 * 7));
}

export function readEditorSession(cookies: CookieWriter) {
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
  return value;
}

