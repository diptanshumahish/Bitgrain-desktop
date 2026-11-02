import { isInternalEmail } from "./internal-traffic";

const OPT_OUT_STORAGE_KEY = "bitgrain-tracking-opt-out";
const OPT_OUT_VALUE = "1";

const readStoredOptOut = (): boolean => {
  try {
    return localStorage.getItem(OPT_OUT_STORAGE_KEY) === OPT_OUT_VALUE;
  } catch {
    return false;
  }
};

const writeStoredOptOut = (optedOut: boolean): void => {
  try {
    if (optedOut) localStorage.setItem(OPT_OUT_STORAGE_KEY, OPT_OUT_VALUE);
    else localStorage.removeItem(OPT_OUT_STORAGE_KEY);
  } catch {
    return;
  }
};

const optOutRef = { current: typeof window !== "undefined" && readStoredOptOut() };

export const isTrackingOptedOut = (): boolean => optOutRef.current;

export const applyTrackingOptOut = (email: string): boolean => {
  optOutRef.current = isInternalEmail(email);
  writeStoredOptOut(optOutRef.current);
  return optOutRef.current;
};
