export const SLOW_SERVER_MESSAGE = "This is taking longer than usual. Please try again in a moment.";
export const OFFLINE_MESSAGE = "We couldn't reach Bitgrain. Check your connection and try again.";

export function isTimeoutError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError");
}

export function describeRequestError(error: unknown): string {
  return isTimeoutError(error) ? SLOW_SERVER_MESSAGE : OFFLINE_MESSAGE;
}
