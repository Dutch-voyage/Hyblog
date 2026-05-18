import { getCurrentUser } from '../auth';

const ANON_KEY = 'hybrid-blog-quiz-history';
const USER_KEY_PREFIX = 'hybrid-blog-quiz-history:';
const MAX_ENTRIES = 50;

export interface QuizAttempt {
  id: string;
  quizVersion: string;
  type: string;
  soulFlavor: string;
  scores: number[];
  answers: Record<string, string>;
  locale: 'zh' | 'en';
  takenAt: string;
}

function historyKey(): string {
  const user = getCurrentUser();
  return user ? `${USER_KEY_PREFIX}${user.id}` : ANON_KEY;
}

function newAttemptId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `att-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function loadHistory(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(historyKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuizAttempt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAttempt(attempt: Omit<QuizAttempt, 'id'>): QuizAttempt {
  const full: QuizAttempt = { id: newAttemptId(), ...attempt };
  const list = loadHistory();
  list.unshift(full);
  const trimmed = list.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(historyKey(), JSON.stringify(trimmed));
  } catch {
    // ignore
  }
  return full;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(historyKey());
  } catch {
    // noop
  }
}
