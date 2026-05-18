import { getCurrentUser } from './auth';

const ANON_KEY = 'hybrid-blog-reader-profile';
const USER_KEY_PREFIX = 'hybrid-blog-reader-profile:';

export interface ReaderProfile {
  quizVersion: string;
  type: string;
  scores: number[];
  soulFlavor: string;
  takenAt: string;
  locale: 'zh' | 'en';
}

function profileKey(): string {
  const user = getCurrentUser();
  return user ? `${USER_KEY_PREFIX}${user.id}` : ANON_KEY;
}

export function saveProfile(profile: ReaderProfile): void {
  try {
    localStorage.setItem(profileKey(), JSON.stringify(profile));
  } catch {
    // localStorage may be unavailable (private browsing, SSR, etc.)
  }
}

export function loadProfile(): ReaderProfile | null {
  try {
    const raw = localStorage.getItem(profileKey());
    return raw ? (JSON.parse(raw) as ReaderProfile) : null;
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(profileKey());
  } catch {
    // noop
  }
}
