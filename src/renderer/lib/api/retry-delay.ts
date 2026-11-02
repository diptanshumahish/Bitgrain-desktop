import { API_RETRY_BASE_DELAY_MS } from "./api-timeouts";

const BACKOFF_FACTOR = 2;

export function waitFor(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

export function backoffDelayMs(attempt: number): number {
  return API_RETRY_BASE_DELAY_MS * BACKOFF_FACTOR ** attempt;
}
