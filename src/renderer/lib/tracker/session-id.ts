const SESSION_KEY = "imgi_session";
const SESSION_IDLE_MS = 30 * 60 * 1000;

interface StoredSession {
  id: string;
  lastSeenAt: number;
}

const readSession = (): StoredSession | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
};

export function getSessionID(): string {
  const now = Date.now();
  const stored = readSession();
  const isFresh = stored !== null && now - stored.lastSeenAt < SESSION_IDLE_MS;
  const session: StoredSession = { id: isFresh ? stored.id : crypto.randomUUID(), lastSeenAt: now };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    return session.id;
  }
  return session.id;
}
