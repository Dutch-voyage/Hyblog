/**
 * Lightweight local-first user system.
 *
 * Username uniqueness is currently enforced only within this browser/device
 * (against the local user registry in localStorage). True cross-device global
 * uniqueness would require a backend; the types here are designed to migrate
 * to a backend-backed store later without changing call sites.
 */

export interface PasswordRecord {
  /** Base64-encoded PBKDF2 derived key. */
  hash: string;
  /** Base64-encoded random salt used for derivation. */
  salt: string;
  /** Iteration count used by PBKDF2 (stored for future migration). */
  iterations: number;
  /** Hash algorithm tag, in case we ever change it. */
  algo: 'PBKDF2-SHA256';
}

export interface LocalUser {
  /** Stable local user ID (uuid-ish). */
  id: string;
  /** Display name. Globally unique only within this browser. */
  username: string;
  /** Present iff the user opted into password protection. */
  password?: PasswordRecord;
  /** ISO timestamp of account creation. */
  createdAt: string;
  /** ISO timestamp of last successful sign-in. */
  lastSignInAt?: string;
}

export interface SessionState {
  /** Currently signed-in user id, or null if anonymous. */
  userId: string | null;
  /** ISO timestamp the session was established. */
  since: string | null;
}

export type AuthErrorCode =
  | 'username-empty'
  | 'username-too-long'
  | 'username-invalid-chars'
  | 'username-taken'
  | 'unknown-user'
  | 'password-required'
  | 'password-wrong'
  | 'crypto-unavailable';

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'AuthError';
  }
}
