import { useEffect, useState } from "react";
import {
  LAYER_EFFECT_WORKING_MAX,
  LAYER_GRADE_WORKING_MAX,
} from "../../../components/studio/hooks/effect-working-resolution";
import { hasPhotoLook, photoLookKey, type PhotoLook } from "./photo-look";
import { renderPhotoLook } from "./render-photo-look";

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

const renderPreviewUrl = async (src: string, look: PhotoLook): Promise<string> => {
  const img = await loadImage(src);
  const result = await renderPhotoLook(img, look, {
    gradeMax: LAYER_GRADE_WORKING_MAX,
    effectMax: LAYER_EFFECT_WORKING_MAX,
  });
  return result instanceof HTMLCanvasElement ? result.toDataURL("image/png") : src;
};

export const usePhotoLookPreview = (src: string | null | undefined, look: PhotoLook): string | null => {
  const [cached, setCached] = useState<CachedPreview | null>(null);
  const currentKey = src && hasPhotoLook(look) ? `${src}::${photoLookKey(look)}` : null;

  useEffect(() => {
    if (!currentKey || !src) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const url = await renderPreviewUrl(src, look);
        if (!cancelled) setCached({ key: currentKey, url });
      } catch (error) {
        console.error("layer look preview failed:", error);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  if (!currentKey) return null;
  return cached?.key === currentKey ? cached.url : null;
};
