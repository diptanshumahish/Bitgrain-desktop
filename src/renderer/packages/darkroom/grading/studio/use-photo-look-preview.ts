import { useEffect, useState } from "react";
import { hasPhotoLook, type PhotoLook } from "@bitgrain/studio-core/effects/photo-look/photo-look";
import { isCancelledRender, peekPhotoLook, releasePhotoLook } from "./photo-look-cache";
import { acquirePhotoLookPreview, photoLookPreviewKey } from "./photo-look-preview-url";

const DEBOUNCE_MS = 120;

interface ResolvedPreview {
  key: string;
  url: string;
}

export const usePhotoLookPreview = (src: string | null | undefined, look: PhotoLook): string | null => {
  const [resolved, setResolved] = useState<ResolvedPreview | null>(null);
  const currentKey = src && hasPhotoLook(look) ? photoLookPreviewKey(src, look) : null;

  useEffect(() => {
    if (!currentKey || !src) return;
    let cancelled = false;
    let acquired = false;
    const acquire = (): void => {
      acquired = true;
      acquirePhotoLookPreview(src, look)
        .then((url) => {
          if (!cancelled) setResolved({ key: currentKey, url });
        })
        .catch((error: unknown) => {
          if (!cancelled && !isCancelledRender(error)) console.error("layer look preview failed:", error);
        });
    };
    const isCached = peekPhotoLook(currentKey) !== null;
    const timer = isCached ? null : window.setTimeout(acquire, DEBOUNCE_MS);
    if (isCached) acquire();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      if (acquired) releasePhotoLook(currentKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  if (!currentKey) return null;
  if (resolved?.key === currentKey) return resolved.url;
  return peekPhotoLook(currentKey);
};
