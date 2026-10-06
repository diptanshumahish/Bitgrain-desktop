import { signal } from "../lib/signal";
import type { UserCredits } from "../hooks/useUser";

const STORAGE_KEY_ACCOUNT_CACHE = "bitgrain_a_cache";

const getInitialAccount = (): UserCredits | null => {
  const cached =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY_ACCOUNT_CACHE)
      : null;
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }
  return null;
};

export const accountCreditsSignal = signal<UserCredits | null>(
  getInitialAccount(),
);
