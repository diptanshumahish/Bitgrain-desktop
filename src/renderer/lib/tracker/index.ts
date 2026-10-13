import analytics from "../analytics";
import { resolveSurface } from "./track-surface";
import { recordToDatabase } from "./database-sink";
import type { TrackPage } from "./track-page";

export { getAnonymousID } from "./anonymous-id";
export type { TrackPage } from "./track-page";

export interface TrackOptions {
  details?: Record<string, unknown>;
  immediate?: boolean;
}

export function trackEvent(page: TrackPage, event: string, options: TrackOptions = {}): Promise<void> {
  const { details = {}, immediate = false } = options;
  const action = `${page}:${event}`;
  analytics.capture(action, { ...details, surface: resolveSurface(window.location.pathname) });
  return recordToDatabase(action, details, immediate);
}
