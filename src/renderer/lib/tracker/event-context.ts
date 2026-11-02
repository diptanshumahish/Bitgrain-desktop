import { resolveSurface, type TrackSurface } from "./track-surface";

const MARKETING_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "ref", "source", "s", "affiliate", "campaign",
];

const MOBILE_MAX_WIDTH = 768;

export interface EventContext {
  path: string;
  referrer: string;
  surface: TrackSurface;
  viewport: "mobile" | "desktop";
  [marketingKey: string]: string;
}

function getMarketingParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const marketing: Record<string, string> = {};
  MARKETING_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) marketing[key] = value;
  });
  return marketing;
}

export function buildEventContext(): EventContext {
  return {
    ...getMarketingParams(),
    path: window.location.pathname,
    referrer: document.referrer,
    surface: resolveSurface(window.location.pathname),
    viewport: window.innerWidth < MOBILE_MAX_WIDTH ? "mobile" : "desktop",
  };
}
