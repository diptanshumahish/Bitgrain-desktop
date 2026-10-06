import { useEffect, useState } from "react";
import type { BitgrainEffect } from "../../../data/studioTypes";
import { applyBitgrainEffectAsync } from "../../../utils/bitgrain-effect";
import { LAYER_EFFECT_WORKING_MAX } from "./effect-working-resolution";

const DEBOUNCE_MS = 120;

interface CachedPreview {
  key: string;
  url: string;
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });

const buildKey = (
  src: string | null | undefined,
  effect: BitgrainEffect | undefined,
): string | null => {
  if (!src || !effect) return null;
  return `${src}::${effect.kind}::${JSON.stringify(effect.params ?? {})}`;
};

export const useBitgrainPreview = (
  src: string | null | undefined,
  effect: BitgrainEffect | undefined,
): string | null => {
  const [cached, setCached] = useState<CachedPreview | null>(null);
  const currentKey = buildKey(src, effect);

  useEffect(() => {
    if (!currentKey || !src || !effect) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const img = await loadImage(src);
        if (cancelled) return;
        const canvas = await applyBitgrainEffectAsync(img, effect, {
          maxDimension: LAYER_EFFECT_WORKING_MAX,
        });
        if (cancelled) return;
        const url = canvas.toDataURL("image/png");
        setCached({ key: currentKey, url });
      } catch {
        // load or render failed; cache stays stale and render returns null
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [src, effect, currentKey]);

  if (!currentKey) return null;
  return cached?.key === currentKey ? cached.url : null;
};
