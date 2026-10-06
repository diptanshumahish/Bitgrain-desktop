import { signal } from "./signal";

const ENV_API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const ADMIN_HOST_KEY = "bitgrain_admin_host";
const ADMIN_TOKEN_KEY = "bitgrain_admin_token";

const readLocalStorage = (key: string): string => {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(key) ?? "";
};

export const resolveApiBase = (): string => {
  const adminHost = readLocalStorage(ADMIN_HOST_KEY);
  if (adminHost) return adminHost.replace(/\/$/, "");
  return ENV_API_BASE ?? "";
};

export const getAdminToken = (): string => readLocalStorage(ADMIN_TOKEN_KEY);

export function resolveAssetUrl(
  src: string | null | undefined,
): string | null {
  if (!src) return null;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith("/api/")) {
    const base = resolveApiBase();
    return base ? `${base}${src}` : src;
  }
  return src;
}

export const backendEnabled = !!(ENV_API_BASE || readLocalStorage(ADMIN_HOST_KEY));
export const backendOnlineSignal = signal<boolean>(backendEnabled);

const DEFAULT_TIMEOUT_MS = 4000;

export async function callApi<T>(
  path: string,
  options?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const base = resolveApiBase();
  if (!base) return null;
  const adminToken = readLocalStorage(ADMIN_TOKEN_KEY);
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  if (adminToken && !headers["X-Admin-Token"]) {
    headers["X-Admin-Token"] = adminToken;
  }
  // Bearer fallback for the desktop Google flow, alongside cookie sessions.
  const sessionToken = readLocalStorage("bitgrain_session_token");
  if (sessionToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }
  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status >= 500) backendOnlineSignal.value = false;
      return null;
    }
    backendOnlineSignal.value = true;
    return res.json() as Promise<T>;
  } catch {
    backendOnlineSignal.value = false;
    return null;
  }
}
