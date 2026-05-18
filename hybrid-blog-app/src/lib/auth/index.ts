import {
  AuthError,
  type LocalUser,
  type SessionState,
} from './types';
import { hashPassword, verifyPassword } from './crypto';
import {
  clearSession,
  findById,
  findByUsername,
  newUserId,
  readSession,
  upsertUser,
  writeSession,
} from './store';

export { AuthError } from './types';
export type { LocalUser, SessionState } from './types';

const USERNAME_MAX = 32;
const USERNAME_RE = /^[\p{L}\p{N}_.\-]+$/u;

export function validateUsername(username: string): void {
  const trimmed = username.trim();
  if (!trimmed) throw new AuthError('username-empty');
  if (trimmed.length > USERNAME_MAX) throw new AuthError('username-too-long');
  if (!USERNAME_RE.test(trimmed)) throw new AuthError('username-invalid-chars');
}

export interface SignUpInput {
  username: string;
  password?: string;
}

export async function signUp(input: SignUpInput): Promise<LocalUser> {
  const username = input.username.trim();
  validateUsername(username);
  if (findByUsername(username)) {
    throw new AuthError('username-taken');
  }
  const user: LocalUser = {
    id: newUserId(),
    username,
    createdAt: new Date().toISOString(),
  };
  if (input.password && input.password.length > 0) {
    user.password = await hashPassword(input.password);
  }
  user.lastSignInAt = user.createdAt;
  upsertUser(user);
  writeSession({ userId: user.id, since: user.createdAt });
  return user;
}

export interface SignInInput {
  username: string;
  password?: string;
}

export async function signIn(input: SignInInput): Promise<LocalUser> {
  const username = input.username.trim();
  validateUsername(username);
  const user = findByUsername(username);
  if (!user) throw new AuthError('unknown-user');

  if (user.password) {
    if (!input.password) throw new AuthError('password-required');
    const ok = await verifyPassword(input.password, user.password);
    if (!ok) throw new AuthError('password-wrong');
  }

  const now = new Date().toISOString();
  const updated: LocalUser = { ...user, lastSignInAt: now };
  upsertUser(updated);
  writeSession({ userId: updated.id, since: now });
  return updated;
}

export function signOut(): void {
  clearSession();
}

export function getSession(): SessionState {
  return readSession();
}

export function getCurrentUser(): LocalUser | null {
  const session = readSession();
  if (!session.userId) return null;
  return findById(session.userId) ?? null;
}

/** True iff this username exists locally (case-insensitive). */
export function usernameExists(username: string): boolean {
  try {
    validateUsername(username);
  } catch {
    return false;
  }
  return Boolean(findByUsername(username.trim()));
}

/** Friendly bilingual error messages. */
export function describeError(err: unknown, locale: 'en' | 'zh' = 'en'): string {
  if (!(err instanceof AuthError)) {
    return locale === 'en' ? 'Unknown error.' : '未知错误。';
  }
  const map: Record<string, { en: string; zh: string }> = {
    'username-empty': {
      en: 'Username cannot be empty.',
      zh: '用户名不能为空。',
    },
    'username-too-long': {
      en: `Username must be at most ${USERNAME_MAX} characters.`,
      zh: `用户名最多 ${USERNAME_MAX} 个字符。`,
    },
    'username-invalid-chars': {
      en: 'Use letters, numbers, underscore, dot, or hyphen only.',
      zh: '只能使用字母、数字、下划线、点或连字符。',
    },
    'username-taken': {
      en: 'This username is already taken on this device.',
      zh: '此用户名在本设备上已被占用。',
    },
    'unknown-user': {
      en: 'No such user on this device.',
      zh: '本设备上没有此用户。',
    },
    'password-required': {
      en: 'This account has a password. Please enter it.',
      zh: '此账户设有密码，请输入。',
    },
    'password-wrong': {
      en: 'Incorrect password.',
      zh: '密码不正确。',
    },
    'crypto-unavailable': {
      en: 'Secure crypto is not available in this browser.',
      zh: '当前浏览器无法使用安全加密功能。',
    },
  };
  return map[err.code]?.[locale] ?? err.message;
}
