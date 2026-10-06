import type { TransformMode } from "../../../../engine/types";

const PIXEL_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>([
  "dither",
  "ascii",
  "braille",
  "dot-matrix",
  "grunge",
  "blocky",
  "pixelate",
]);

export function hasPixelMode(modes: TransformMode[]): boolean {
  return modes.some((mode) => PIXEL_MODES.has(mode));
}
