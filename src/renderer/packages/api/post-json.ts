import { resolveApiBase } from "./api-client";
import { API_DEFAULT_TIMEOUT_MS } from "./api-timeouts";
import { describeRequestError } from "./request-errors";

export interface JsonResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

const NETWORK_FAILURE_STATUS = 0;
const NO_API_MESSAGE = "Bitgrain isn't configured to reach its server.";

const readJson = async <T>(res: Response): Promise<(T & { error?: string }) | null> => {
  try {
    return (await res.json()) as T & { error?: string };
  } catch {
    return null;
  }
};

export async function postJson<T>(
  path: string,
  body: unknown,
  timeoutMs: number = API_DEFAULT_TIMEOUT_MS,
): Promise<JsonResult<T>> {
  const base = resolveApiBase();
  if (!base) return { ok: false, status: NETWORK_FAILURE_STATUS, data: null, error: NO_API_MESSAGE };
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await readJson<T>(res);
    return { ok: res.ok, status: res.status, data, error: res.ok ? null : (data?.error ?? null) };
  } catch (error) {
    return { ok: false, status: NETWORK_FAILURE_STATUS, data: null, error: describeRequestError(error) };
  }
}
