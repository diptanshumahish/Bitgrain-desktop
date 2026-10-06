import type { TransformMode } from "../types";

// A mode is band-splittable only if its output at pixel (x, y) depends solely on
// the input pixel (x, y). Splitting the image into horizontal strips and running
// each strip in its own worker is then byte-identical to running the whole image
// in one pass. Verified against the plugin source: these loop purely by pixel
// index with no coordinate, neighbourhood, or full-dimension dependence.
//
// Everything not listed is excluded on purpose. Vignette reads the image centre,
// sharpen reads neighbours, pixelate derives its block from max(width, height),
// and every texture (halftone, dither, ascii, grain, ...) is grid or neighbourhood
// based. Splitting any of those would seam at band boundaries.
const BAND_SAFE_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>([
  "invert",
  "grayscale",
  "lut",
  "colorgrade",
  "duotone",
  "posterize",
  "colorwash",
]);

export const isBandSafeMode = (mode: TransformMode): boolean =>
  BAND_SAFE_MODES.has(mode);

export const isBandSplittable = (
  mode: TransformMode | TransformMode[],
): boolean => {
  const modes = Array.isArray(mode) ? mode : [mode];
  if (modes.length === 0) return false;
  return modes.every(isBandSafeMode);
};
