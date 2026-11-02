import type { HalftoneShape } from "./halftone-defaults";
import { shapeDistance, shapeReach } from "./dot-shapes";

const SOFTNESS_PER_CELL = 0.25;
const SHARPNESS_SCALE = 100;

export const edgeWidthFor = (sharpness: number, cellPx: number, pixelSize = 1): number => {
  const softness = (1 - sharpness / SHARPNESS_SCALE) * cellPx * SOFTNESS_PER_CELL;
  return pixelSize + Math.max(0, softness);
};

export const dotRadiusFor = (density: number, cellPx: number, shape: HalftoneShape): number =>
  cellPx * shapeReach(density, shape);

export const dotCoverage = (
  offX: number,
  offY: number,
  radius: number,
  edgeWidth: number,
  shape: HalftoneShape,
): number => {
  const coverage = 0.5 + (radius - shapeDistance(offX, offY, shape)) / edgeWidth;
  return coverage < 0 ? 0 : coverage > 1 ? 1 : coverage;
};
