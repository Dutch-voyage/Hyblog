import type { LocalUser, SessionState } from './types';

const USERS_KEY = 'hybrid-blog-users';
const SESSION_KEY = 'hybrid-blog-session';

interface UsersFile {
  version: 1;
  users: LocalUser[];
}

function readUsers(): UsersFile {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return { version: 1, users: [] };
    const parsed = JSON.parse(raw) as UsersFile;
    if (!parsed || !Array.isArray(parsed.users)) return { version: 1, users: [] };
    return parsed;
  } catch {
    return { version: 1, users: [] };
  }
}

function writeUsers(file: UsersFile): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(file));
  } catch {
    // ignore quota / private mode errors
  }
}

export function listUsers(): LocalUser[] {
  return readUsers().users;
}

export function findByUsername(username: string): LocalUser | undefined {
  const lc = username.toLowerCase();
  return readUsers().users.find((u) => u.username.toLowerCase() === lc);
}

export function findById(id: string): LocalUser | undefined {
  return readUsers().users.find((u) => u.id === id);
}

export function upsertUser(user: LocalUser): void {
  const file = readUsers();
  const idx = file.users.findIndex((u) => u.id === user.id);
  if (idx >= 0) file.users[idx] = user;
  else file.users.push(user);
  writeUsers(file);
}

export function readSession(): SessionState {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { userId: null, since: null };
    return JSON.parse(raw) as SessionState;
  } catch {
    return { userId: null, since: null };
  }
}

export function writeSession(state: SessionState): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

/** Make a v4-ish random ID without pulling in a uuid lib. */
export function newUserId(): string {
  const c = crypto as Crypto;
  if (typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  const bytes = c.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
