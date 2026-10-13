import { API_HEALTH_PROBE_TIMEOUT_MS } from "./api-timeouts";
import { isTimeoutError } from "./request-errors";

export type BackendHealth = "up" | "slow" | "down";

const MAINTENANCE_STATUS = "maintenance";
const SERVER_ERROR_STATUS = 500;

interface HealthPayload {
  status?: string;
}

async function readHealthStatus(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as HealthPayload;
    return payload.status ?? "";
  } catch {
    return "";
  }
}

const isDeviceOffline = (): boolean =>
  typeof navigator !== "undefined" && navigator.onLine === false;

export async function probeBackendHealth(apiBase: string): Promise<BackendHealth> {
  if (isDeviceOffline()) return "slow";
  try {
    const response = await fetch(`${apiBase}/health`, {
      signal: AbortSignal.timeout(API_HEALTH_PROBE_TIMEOUT_MS),
    });
    if (response.status >= SERVER_ERROR_STATUS) return "down";
    const status = await readHealthStatus(response);
    return status === MAINTENANCE_STATUS ? "down" : "up";
  } catch (error) {
    return isTimeoutError(error) || isDeviceOffline() ? "slow" : "down";
  }
}
