import { signal } from "./signal";
import { API_DEFAULT_TIMEOUT_MS, API_GET_RETRY_ATTEMPTS } from "./api/api-timeouts";
import { isTimeoutError } from "./api/request-errors";
import { backoffDelayMs, waitFor } from "./api/retry-delay";
import { NOT_FOUND_STATUS, type ApiOutcome } from "./api/api-outcome";

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

const SERVER_ERROR_STATUS = 500;

type ApiAttempt<T> =
  | { kind: "response"; status: number; data: T | null }
  | { kind: "retryable"; error: unknown };

const isIdempotentRequest = (options?: RequestInit): boolean => {
  const method = (options?.method ?? "GET").toUpperCase();
  return method === "GET" || method === "HEAD";
};

const buildHeaders = (options?: RequestInit): Record<string, string> => {
  const adminToken = readLocalStorage(ADMIN_TOKEN_KEY);
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  if (adminToken && !headers["X-Admin-Token"]) headers["X-Admin-Token"] = adminToken;
  // Bearer fallback for the desktop Google flow, alongside cookie sessions.
  const sessionToken = readLocalStorage("bitgrain_session_token");
  if (sessionToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }
  return headers;
};

const readResponse = async <T>(res: Response): Promise<T | null> => {
  if (!res.ok) {
    if (res.status >= SERVER_ERROR_STATUS) backendOnlineSignal.value = false;
    return null;
  }
  backendOnlineSignal.value = true;
  return parseJson<T>(res);
};

const parseJson = async <T>(res: Response): Promise<T | null> => {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

const attemptRequest = async <T>(
  url: string,
  options: RequestInit | undefined,
  timeoutMs: number,
): Promise<ApiAttempt<T>> => {
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: buildHeaders(options),
      signal: AbortSignal.timeout(timeoutMs),
      credentials: "include",
    });
  } catch (error) {
    return { kind: "retryable", error };
  }
  return { kind: "response", status: res.status, data: await readResponse<T>(res) };
};

const markUnreachable = (error: unknown): null => {
  if (!isTimeoutError(error)) backendOnlineSignal.value = false;
  return null;
};

const requestWithRetries = async <T>(
  path: string,
  options: RequestInit | undefined,
  timeoutMs: number,
): Promise<ApiAttempt<T> | null> => {
  const base = resolveApiBase();
  if (!base) return null;
  const maxAttempts = isIdempotentRequest(options) ? API_GET_RETRY_ATTEMPTS + 1 : 1;
  let outcome = await attemptRequest<T>(`${base}${path}`, options, timeoutMs);
  for (let attempt = 1; attempt < maxAttempts && outcome.kind === "retryable"; attempt++) {
    await waitFor(backoffDelayMs(attempt - 1));
    outcome = await attemptRequest<T>(`${base}${path}`, options, timeoutMs);
  }
  if (outcome.kind === "retryable") markUnreachable(outcome.error);
  return outcome;
};

export async function callApi<T>(
  path: string,
  options?: RequestInit,
  timeoutMs: number = API_DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const outcome = await requestWithRetries<T>(path, options, timeoutMs);
  return outcome?.kind === "response" ? outcome.data : null;
}

export async function callApiWithOutcome<T>(
  path: string,
  options?: RequestInit,
  timeoutMs: number = API_DEFAULT_TIMEOUT_MS,
): Promise<ApiOutcome<T>> {
  const outcome = await requestWithRetries<T>(path, options, timeoutMs);
  if (!outcome || outcome.kind === "retryable") return { kind: "failed" };
  if (outcome.status === NOT_FOUND_STATUS) return { kind: "not_found" };
  if (outcome.data === null) return { kind: "failed" };
  return { kind: "ok", data: outcome.data };
}
