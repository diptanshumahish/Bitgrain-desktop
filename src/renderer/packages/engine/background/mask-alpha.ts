import { MASK_CEILING, MASK_FLOOR } from "./model-config";

const RGBA_STRIDE = 4;
const ALPHA_OFFSET = 3;
const MAX_CHANNEL = 255;

interface ValueRange {
  min: number;
  max: number;
}

const findRange = (values: Float32Array): ValueRange => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
};

const applyLevels = (value: number): number => {
  const lifted = (value - MASK_FLOOR) / (MASK_CEILING - MASK_FLOOR);
  return Math.min(1, Math.max(0, lifted));
};

export const normalizeMask = (values: Float32Array): Float32Array => {
  const { min, max } = findRange(values);
  const span = max - min || 1;
  return values.map((value) => applyLevels((value - min) / span));
};

export const alphaToRgba = (alpha: Float32Array): Uint8ClampedArray<ArrayBuffer> => {
  const rgba = new Uint8ClampedArray(alpha.length * RGBA_STRIDE);
  for (let index = 0; index < alpha.length; index += 1) {
    rgba[index * RGBA_STRIDE + ALPHA_OFFSET] = alpha[index] * MAX_CHANNEL;
  }
  return rgba;
};

export const maskToRgba = (values: Float32Array): Uint8ClampedArray<ArrayBuffer> => alphaToRgba(normalizeMask(values));
