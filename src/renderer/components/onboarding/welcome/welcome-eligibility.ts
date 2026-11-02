import type { AuthUser } from "../../../hooks/useAuth";

const WELCOME_SEEN_KEY = "bitgrain_welcome_seen";
const WELCOME_REPLAY_PARAM = "welcome";
const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000;

const hasSeenWelcome = (): boolean => {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) !== null;
  } catch {
    return true;
  }
};

const isReplayRequested = (): boolean =>
  new URLSearchParams(window.location.search).has(WELCOME_REPLAY_PARAM);

const isNewAccount = (user: AuthUser): boolean => {
  const createdAt = Date.parse(user.createdAt);
  if (Number.isNaN(createdAt)) return false;
  return Date.now() - createdAt < NEW_ACCOUNT_WINDOW_MS;
};

export const isWelcomeEligible = (user: AuthUser): boolean =>
  isReplayRequested() || (isNewAccount(user) && !hasSeenWelcome());

export const markWelcomeSeen = (): void => {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, new Date().toISOString());
  } catch (error) {
    console.warn("Could not remember the welcome intro", error);
  }
};
