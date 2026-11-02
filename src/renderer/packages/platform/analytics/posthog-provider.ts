import type { AnalyticsClient } from "./analytics-types";

// Desktop: PostHog is not bundled (PORTED.md deviation 2). The analytics module
// already treats a null client as "analytics off", so no call site changes.
export const loadPostHogClient = async (): Promise<AnalyticsClient | null> => null;
