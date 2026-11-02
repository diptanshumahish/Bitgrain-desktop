import { signal } from "@bitgrain/core/signal";
import type { UserCredits } from "./use-user";

export const STORAGE_KEY_ACCOUNT_CACHE = "bitgrain_a_cache";

type CreditsStatus = "idle" | "loading" | "ready" | "failed";

export const readCachedAccountCredits = (): UserCredits | null => {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(STORAGE_KEY_ACCOUNT_CACHE);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as UserCredits;
  } catch {
    return null;
  }
};

export const accountCreditsSignal = signal<UserCredits | null>(
  readCachedAccountCredits(),
);

export const creditsStatusSignal = signal<CreditsStatus>("idle");

export const clearCachedAccountCredits = (): void => {
  accountCreditsSignal.value = null;
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY_ACCOUNT_CACHE);
};
