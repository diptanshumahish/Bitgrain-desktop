import { resolveApiBase } from "@bitgrain/api/api-client";
import { API_DEFAULT_TIMEOUT_MS } from "@bitgrain/api/api-timeouts";
import { describeRequestError } from "@bitgrain/api/request-errors";
import type { JsonResult } from "@bitgrain/api/post-json";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const NETWORK_FAILURE_STATUS = 0;
const NO_API_MESSAGE = "Bitgrain isn't configured to reach its server.";
const FALLBACK_ERROR = "Something went wrong. Please try again.";

const readJson = async <T>(res: Response): Promise<(T & { error?: string }) | null> => {
  try {
    return (await res.json()) as T & { error?: string };
  } catch {
    return null;
  }
};

const buildInit = (method: HttpMethod, body: unknown): RequestInit => {
  const init: RequestInit = { method, credentials: "include", signal: AbortSignal.timeout(API_DEFAULT_TIMEOUT_MS) };
  if (body === undefined) return init;
  return { ...init, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
};

const describeFailure = (status: number, message: string | undefined): string => {
  if (message) return message.charAt(0).toUpperCase() + message.slice(1);
  return status === NETWORK_FAILURE_STATUS ? NO_API_MESSAGE : FALLBACK_ERROR;
};

export async function requestJson<T>(path: string, method: HttpMethod = "GET", body?: unknown): Promise<JsonResult<T>> {
  const base = resolveApiBase();
  if (!base) return { ok: false, status: NETWORK_FAILURE_STATUS, data: null, error: NO_API_MESSAGE };
  try {
    const res = await fetch(`${base}${path}`, buildInit(method, body));
    const data = await readJson<T>(res);
    const error = res.ok ? null : describeFailure(res.status, data?.error);
    return { ok: res.ok, status: res.status, data: res.ok ? data : null, error };
  } catch (error) {
    return { ok: false, status: NETWORK_FAILURE_STATUS, data: null, error: describeRequestError(error) };
  }
}
