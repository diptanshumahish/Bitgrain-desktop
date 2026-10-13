import type { WorkerMaskLayer } from "./mask-types";
import type { BrushAlphaMap } from "./apply-local-masks";
import { rasterizeBrushAlpha } from "./brush-alpha";

let brushBitmaps: Record<string, ImageBitmap> = {};
const alphaCache = new Map<string, Float32Array>();

export const setWorkerBrushes = (brushes: Record<string, ImageBitmap>): void => {
  for (const bitmap of Object.values(brushBitmaps)) bitmap.close();
  brushBitmaps = brushes;
  alphaCache.clear();
};

const brushAlphaFor = (id: string, width: number, height: number): Float32Array | null => {
  const bitmap = brushBitmaps[id];
  if (!bitmap) return null;
  const key = `${id}:${width}x${height}`;
  const cached = alphaCache.get(key);
  if (cached) return cached;
  const alpha = rasterizeBrushAlpha(bitmap, width, height);
  alphaCache.set(key, alpha);
  return alpha;
};

export const resolveBrushAlphas = (masks: WorkerMaskLayer[] | undefined, width: number, height: number): BrushAlphaMap => {
  const result: BrushAlphaMap = {};
  for (const mask of masks ?? []) {
    if (!mask.area.hasBrush) continue;
    const alpha = brushAlphaFor(mask.id, width, height);
    if (alpha) result[mask.id] = alpha;
  }
  return result;
};
