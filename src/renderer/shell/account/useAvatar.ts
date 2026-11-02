import { useEffect, useState } from "react";

// Resolves a user avatar URL into something the renderer is actually allowed to
// display. Local sources (`data:`/`blob:`) pass straight through; remote
// provider CDNs (Google, etc.) are blocked by the production CSP, so they're
// proxied through the main process into a `data:` URL. Results are memoized per
// URL so the title-bar chip and the settings panel don't fetch twice, and a
// failure resolves to null (the callers fall back to a generated glyph avatar).
const cache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

const isLocal = (url: string): boolean =>
  url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("app:");

async function resolve(url: string): Promise<string | null> {
  if (cache.has(url)) return cache.get(url) ?? null;
  if (isLocal(url)) {
    cache.set(url, url);
    return url;
  }
  let pending = inflight.get(url);
  if (!pending) {
    pending = (window.bitgrain?.resolveAvatar(url) ?? Promise.resolve(null))
      .then((resolved) => {
        cache.set(url, resolved);
        inflight.delete(url);
        return resolved;
      })
      .catch(() => {
        cache.set(url, null);
        inflight.delete(url);
        return null;
      });
    inflight.set(url, pending);
  }
  return pending;
}

export function useAvatar(url: string | null | undefined): string | null {
  const [src, setSrc] = useState<string | null>(() =>
    url ? cache.get(url) ?? null : null,
  );

  useEffect(() => {
    if (!url) {
      setSrc(null);
      return;
    }
    let active = true;
    void resolve(url).then((resolved) => {
      if (active) setSrc(resolved);
    });
    return () => {
      active = false;
    };
  }, [url]);

  return src;
}
