const INTERNAL_EMAIL_MARKER = "bitgrain";
const LOCAL_HOSTNAMES: readonly string[] = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"];

const isLocalHost = (): boolean => {
  if (typeof window === "undefined") return false;
  return LOCAL_HOSTNAMES.includes(window.location.hostname);
};

export const isInternalEmail = (email?: string | null): boolean =>
  (email ?? "").toLowerCase().includes(INTERNAL_EMAIL_MARKER);

export const isInternalTraffic = (email?: string): boolean =>
  isInternalEmail(email) || isLocalHost() || Boolean(import.meta.env?.DEV);
