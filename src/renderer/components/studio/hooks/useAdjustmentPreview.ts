import { useEffect, useRef, useState } from "react";
import type {
  BitgrainEffect,
  ImageFilters,
  Layer,
  TemplateDef,
} from "../../../data/studioTypes";
import { applyBitgrainEffectAsync } from "../../../utils/bitgrain-effect";
import { constructFilterString } from "../../../utils/filter-utils";
import { renderToCanvas } from "./export/render-canvas";
import { ADJUSTMENT_WORKING_MAX } from "./effect-working-resolution";

const THROTTLE_MS = 80;

interface AdjustmentRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CachedPreview {
  key: string;
  url: string;
}

const buildKey = (
  belowLayers: Layer[],
  background: string,
  image: string | null,
  effect: BitgrainEffect | undefined,
  filters: ImageFilters | undefined,
  region: AdjustmentRegion,
  pageWidth: number,
  pageHeight: number,
): string | null => {
  if (!effect && !constructFilterString(filters)) return null;
  return JSON.stringify({
    layers: belowLayers,
    background,
    image,
    effect: effect ?? null,
    filters: filters ?? null,
    region,
    pageWidth,
    pageHeight,
  });
};

export const useAdjustmentPreview = (
  belowLayers: Layer[],
  background: string,
  image: string | null,
  effect: BitgrainEffect | undefined,
  filters: ImageFilters | undefined,
  region: AdjustmentRegion,
  pageWidth: number,
  pageHeight: number,
): string | null => {
  const [cached, setCached] = useState<CachedPreview | null>(null);
  const lastRunRef = useRef(0);
  const currentKey = buildKey(
    belowLayers, background, image, effect, filters, region, pageWidth, pageHeight,
  );

  useEffect(() => {
    if (!currentKey || pageWidth <= 0 || pageHeight <= 0) return;

    let cancelled = false;
    // Throttle rather than debounce: a trailing-only debounce never fires
    // during continuous motion (dragging a layer or animation playback), so
    // schedule based on the last run to keep the composite updating live.
    const wait = Math.max(0, THROTTLE_MS - (performance.now() - lastRunRef.current));
    const timer = window.setTimeout(async () => {
      lastRunRef.current = performance.now();
      try {
        const renderScale = Math.min(1, ADJUSTMENT_WORKING_MAX / Math.max(pageWidth, pageHeight));
        const compWidth = Math.max(1, Math.round(pageWidth * renderScale));
        const compHeight = Math.max(1, Math.round(pageHeight * renderScale));
        const template = { width: pageWidth, height: pageHeight } as TemplateDef;
        const composite = await renderToCanvas(
          template, background, belowLayers, image, compWidth, compHeight,
        );
        if (cancelled) return;

        // Output always covers the whole region so it maps 1:1 onto the layer
        // box. Only the slice that overlaps the page is filled; anything past a
        // page edge stays transparent (and is clipped by the page anyway).
        const outWidth = Math.max(1, Math.round(region.width * renderScale));
        const outHeight = Math.max(1, Math.round(region.height * renderScale));
        const regionX = Math.round(region.x * renderScale);
        const regionY = Math.round(region.y * renderScale);
        const sx = Math.max(0, regionX);
        const sy = Math.max(0, regionY);
        const sw = Math.min(compWidth, regionX + outWidth) - sx;
        const sh = Math.min(compHeight, regionY + outHeight) - sy;
        if (sw <= 0 || sh <= 0) return;

        const crop = document.createElement("canvas");
        crop.width = sw;
        crop.height = sh;
        const cropCtx = crop.getContext("2d");
        if (!cropCtx) return;
        cropCtx.drawImage(composite, sx, sy, sw, sh, 0, 0, sw, sh);

        let processed: HTMLCanvasElement = crop;
        if (effect) {
          processed = await applyBitgrainEffectAsync(crop, effect, {
            maxDimension: ADJUSTMENT_WORKING_MAX,
          });
          if (cancelled) return;
        }

        const out = document.createElement("canvas");
        out.width = outWidth;
        out.height = outHeight;
        const outCtx = out.getContext("2d");
        if (!outCtx) return;
        const filterStr = constructFilterString(filters);
        if (filterStr) outCtx.filter = filterStr;
        outCtx.imageSmoothingEnabled = false;
        outCtx.drawImage(processed, 0, 0, processed.width, processed.height, sx - regionX, sy - regionY, sw, sh);

        const url = out.toDataURL("image/png");
        if (cancelled) return;
        setCached({ key: currentKey, url });
      } catch {
        // composite or render failed; cache stays stale and render returns null
      }
    }, wait);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // currentKey encodes every input; re-run only when the visible state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  if (!currentKey) return null;
  return cached?.key === currentKey ? cached.url : null;
};
