import { signal } from "../signal";

const RECENTS_KEY = "template_recents";
const RECENTS_STORED = 10;

function readRecents(): string[] {
  try {
    const saved = localStorage.getItem(RECENTS_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export const templateRecentsSignal = signal<string[]>(readRecents());

export function rememberRecentTemplate(id: string): void {
  const next = [id, ...templateRecentsSignal.value.filter((recentId) => recentId !== id)].slice(0, RECENTS_STORED);
  templateRecentsSignal.value = next;
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}
