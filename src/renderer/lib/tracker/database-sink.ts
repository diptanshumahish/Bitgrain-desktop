import { buildEventContext } from "./event-context";
import { enqueueEvent, flushEvents } from "./event-queue";
import { getSessionID } from "./session-id";

export function recordToDatabase(
  action: string,
  details: Record<string, unknown>,
  immediate: boolean,
): Promise<void> {
  enqueueEvent({
    action,
    metadata: {
      ...details,
      ...buildEventContext(),
      session_id: getSessionID(),
      client_ts: new Date().toISOString(),
    },
  });
  return immediate ? flushEvents() : Promise.resolve();
}
