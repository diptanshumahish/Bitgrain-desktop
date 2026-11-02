type CancelTask = () => void;

const ROUTE_SETTLE_DELAY_MS = 2500;

const scheduleIdle = (task: () => void, timeoutMs: number): CancelTask => {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(() => task(), { timeout: timeoutMs });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(task, timeoutMs);
  return () => window.clearTimeout(handle);
};

const scheduleAfterSettle = (task: () => void, idleTimeoutMs: number): CancelTask => {
  let cancelIdle: CancelTask | null = null;
  const settleHandle = window.setTimeout(() => {
    cancelIdle = scheduleIdle(task, idleTimeoutMs);
  }, ROUTE_SETTLE_DELAY_MS);
  return () => {
    window.clearTimeout(settleHandle);
    cancelIdle?.();
  };
};

export const runAfterPageLoad = (task: () => void, idleTimeoutMs: number): CancelTask => {
  if (typeof window === "undefined") return () => undefined;
  if (document.readyState === "complete") return scheduleAfterSettle(task, idleTimeoutMs);

  let cancelSettled: CancelTask | null = null;
  const handleLoad = (): void => {
    cancelSettled = scheduleAfterSettle(task, idleTimeoutMs);
  };
  window.addEventListener("load", handleLoad, { once: true });
  return () => {
    window.removeEventListener("load", handleLoad);
    cancelSettled?.();
  };
};
