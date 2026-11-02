import type { AnalyticsClient, EventName } from "./analytics-types";
import { createDeferredClient } from "./deferred-client";
import { loadPostHogClient } from "./posthog-provider";
import { recordToDatabase } from "../tracker/database-sink";

export type { EventName } from "./analytics-types";

const isAnalyticsEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  if (import.meta.env.VITE_PUBLIC_ANALYTICS_DEBUG === "true") return true;
  return Boolean(import.meta.env?.PROD);
};

const loadActiveClient = (): Promise<AnalyticsClient | null> => {
  if (!isAnalyticsEnabled()) return Promise.resolve(null);
  return loadPostHogClient();
};

const analytics = createDeferredClient(loadActiveClient);

const mirrorToDatabase = (name: EventName, properties?: Record<string, unknown>): void => {
  if (typeof window === "undefined") return;
  void recordToDatabase(`app:${name}`, properties ?? {}, false);
};

export const trackEvent = (name: EventName, properties?: Record<string, unknown>): void => {
  analytics.capture(name, properties);
  mirrorToDatabase(name, properties);
};

export default analytics;
