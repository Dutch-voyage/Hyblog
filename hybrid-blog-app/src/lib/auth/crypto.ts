import { AuthError, type PasswordRecord } from './types';

const ITERATIONS = 120_000;
const HASH_ALGO = 'SHA-256';
const KEY_BITS = 256;

function getSubtle(): SubtleCrypto {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new AuthError('crypto-unavailable', 'Web Crypto is not available in this environment.');
  }
  return crypto.subtle;
}

function toB64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const subtle = getSubtle();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: HASH_ALGO },
    keyMaterial,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

/** Hash a fresh password. Returns a self-contained PasswordRecord. */
export async function hashPassword(password: string): Promise<PasswordRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, ITERATIONS);
  return {
    hash: toB64(hash),
    salt: toB64(salt),
    iterations: ITERATIONS,
    algo: 'PBKDF2-SHA256',
  };
}

/** Constant-time-ish comparison of two equal-length base64 strings. */
function safeEqualB64(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verify a password against a stored PasswordRecord. */
export async function verifyPassword(password: string, record: PasswordRecord): Promise<boolean> {
  const salt = fromB64(record.salt);
  const hash = await deriveBits(password, salt, record.iterations);
  return safeEqualB64(toB64(hash), record.hash);
}
