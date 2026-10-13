import { callApi } from "../api-client";
import { getAnonymousID } from "./anonymous-id";

const TRACK_ENDPOINT = "/api/track";
const FLUSH_INTERVAL_MS = 3000;
const MAX_BATCH_SIZE = 20;

export interface QueuedEvent {
  action: string;
  metadata: Record<string, unknown>;
}

const pending: QueuedEvent[] = [];
const flushTimerRef: { current: number | null } = { current: null };
const lifecycleBoundRef = { current: false };

const sendEvent = (event: QueuedEvent, anonymousId: string): Promise<unknown> => {
  return callApi(TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...event, anonymous_id: anonymousId }),
    keepalive: true,
  });
};

const sendBatch = async (events: QueuedEvent[]): Promise<void> => {
  const anonymousId = getAnonymousID();
  await Promise.all(events.map((event) => sendEvent(event, anonymousId)));
};

export async function flushEvents(): Promise<void> {
  if (flushTimerRef.current !== null) {
    window.clearTimeout(flushTimerRef.current);
    flushTimerRef.current = null;
  }
  while (pending.length > 0) {
    await sendBatch(pending.splice(0, MAX_BATCH_SIZE));
  }
}

const flushInBackground = (): void => {
  flushEvents().catch((error: unknown) => {
    console.warn("event flush failed", error);
  });
};

const bindLifecycle = (): void => {
  if (lifecycleBoundRef.current) return;
  lifecycleBoundRef.current = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushInBackground();
  });
  window.addEventListener("pagehide", flushInBackground);
};

export function enqueueEvent(event: QueuedEvent): void {
  bindLifecycle();
  pending.push(event);
  if (pending.length >= MAX_BATCH_SIZE) {
    flushInBackground();
    return;
  }
  if (flushTimerRef.current === null) {
    flushTimerRef.current = window.setTimeout(flushInBackground, FLUSH_INTERVAL_MS);
  }
}
