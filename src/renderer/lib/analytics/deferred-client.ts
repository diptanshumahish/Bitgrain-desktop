import type { AnalyticsClient, QueuedCall } from "./analytics-types";

const IDLE_INIT_TIMEOUT_MS = 4000;

const applyCall = (client: AnalyticsClient, call: QueuedCall): void => {
  switch (call.type) {
    case "capture":
      client.capture(call.name, call.properties);
      break;
    case "identify":
      client.identify(call.userId, call.properties);
      break;
    case "register":
      client.register(call.properties);
      break;
    case "reset":
      client.reset();
      break;
    case "setPersonProperties":
      client.setPersonProperties(call.properties);
      break;
  }
};

export const createDeferredClient = (
  loadClient: () => Promise<AnalyticsClient | null>,
): AnalyticsClient => {
  let instance: AnalyticsClient | null = null;
  let loadPromise: Promise<AnalyticsClient | null> | null = null;
  let scheduled = false;
  const queue: QueuedCall[] = [];

  const load = (): Promise<AnalyticsClient | null> => {
    if (loadPromise) return loadPromise;
    loadPromise = loadClient()
      .then((client) => {
        if (!client) {
          queue.length = 0;
          return null;
        }
        instance = client;
        while (queue.length > 0) applyCall(client, queue.shift()!);
        return client;
      })
      .catch((error) => {
        console.warn("Analytics failed to load", error);
        return null;
      });
    return loadPromise;
  };

  const schedule = (): void => {
    if (scheduled || typeof window === "undefined") return;
    scheduled = true;

    const idleWin = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout: number }) => number;
    };

    const start = (): void => {
      void load();
    };

    if (idleWin.requestIdleCallback) {
      idleWin.requestIdleCallback(start, { timeout: IDLE_INIT_TIMEOUT_MS });
    } else {
      window.setTimeout(start, IDLE_INIT_TIMEOUT_MS);
    }

    window.addEventListener("pointerdown", start, { once: true, passive: true });
    window.addEventListener("keydown", start, { once: true });
    window.addEventListener("scroll", start, { once: true, passive: true });
  };

  if (typeof window !== "undefined") schedule();

  const enqueueOrRun = (call: QueuedCall): void => {
    if (instance) {
      applyCall(instance, call);
      return;
    }
    queue.push(call);
    schedule();
  };

  return {
    capture: (name, properties) => enqueueOrRun({ type: "capture", name, properties }),
    identify: (userId, properties) => enqueueOrRun({ type: "identify", userId, properties }),
    register: (properties) => enqueueOrRun({ type: "register", properties }),
    reset: () => enqueueOrRun({ type: "reset" }),
    setPersonProperties: (properties) =>
      enqueueOrRun({ type: "setPersonProperties", properties }),
  };
};
