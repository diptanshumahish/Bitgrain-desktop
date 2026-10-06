import { callApi } from "./api-client";

const ANON_ID_KEY = "imgi_anon_id";

export function getAnonymousID(): string {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export interface TrackOptions {
  details?: Record<string, unknown>;
  immediate?: boolean;
}

const FALLBACK_DELAY_MS = 100;

const MARKETING_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "ref", "source", "s", "affiliate", "campaign",
];

type IdleCallbackWindow = Window & {
  requestIdleCallback?: (cb: () => void) => void;
};

function getMarketingParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const marketing: Record<string, string> = {};

  MARKETING_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) marketing[key] = value;
  });

  return marketing;
}

export async function trackEvent(page: string, event: string, options: TrackOptions = {}): Promise<unknown> {
  const { details = {}, immediate = false } = options;
  const action = `${page}:${event}`;
  const anonymous_id = getAnonymousID();

  const marketingParams = getMarketingParams();

  const metadata = {
    ...details,
    ...marketingParams,
    path: window.location.pathname,
    referrer: document.referrer,
  };

  const body = {
    action,
    metadata,
    anonymous_id,
  };

  if (immediate) {
    return callApi("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  const track = () => {
    callApi("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  };

  const idleWindow = window as IdleCallbackWindow;
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(track);
  } else {
    setTimeout(track, FALLBACK_DELAY_MS);
  }
}
