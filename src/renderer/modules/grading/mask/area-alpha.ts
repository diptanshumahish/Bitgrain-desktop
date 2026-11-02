import type { PixelBuffer } from "../engine/apply-grade";
import type { MaskShape } from "./mask-types";
import { fillShapeAlpha } from "./shape-alpha";
import { multiplyRangeAlpha, type RangeRefinement } from "./range-mask";
import { featherAlpha } from "./feather-alpha";

const PERCENT = 100;
const FEATHER_MAX_FRACTION = 0.04;

export interface AreaGeometry extends RangeRefinement {
  shape: MaskShape | null;
  invert: boolean;
  feather: number;
}

export interface AreaAlphaInput {
  pixels: PixelBuffer;
  width: number;
  height: number;
  area: AreaGeometry;
  brushAlpha: Float32Array | null;
}

const buildRegionAlpha = (shape: MaskShape | null, brushAlpha: Float32Array | null, size: number): Float32Array => {
  if (!shape && !brushAlpha) return new Float32Array(size).fill(1);
  return brushAlpha ? Float32Array.from(brushAlpha) : new Float32Array(size);
};

export const buildAreaAlpha = (input: AreaAlphaInput): Float32Array => {
  const { pixels, width, height, area, brushAlpha } = input;
  const alpha = buildRegionAlpha(area.shape, brushAlpha, width * height);
  if (area.shape) fillShapeAlpha(alpha, area.shape, width, height);
  multiplyRangeAlpha(alpha, pixels, area);
  if (area.invert) {
    for (let index = 0; index < alpha.length; index += 1) alpha[index] = 1 - alpha[index];
  }
  featherAlpha(alpha, width, height, (area.feather / PERCENT) * FEATHER_MAX_FRACTION * Math.max(width, height));
  return alpha;
};
