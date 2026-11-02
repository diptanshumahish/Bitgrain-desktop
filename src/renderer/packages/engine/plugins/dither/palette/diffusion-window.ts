import type { DitherMethod } from "../../../core/types";
import { srgbByteToLinear } from "../../../tone/srgb-linear";
import { flattenKernel } from "../diffusion-kernels";

const RGB_STRIDE = 3;
const RGBA_STRIDE = 4;
const NEXT_PIXEL_TAP = 0;

export interface DiffusionWindow {
  offsetsX: Int32Array;
  offsetsY: Int32Array;
  weights: Float64Array;
  reach: number;
  depth: number;
  slotCount: number;
  rowStride: number;
  rows: Float32Array;
  tapOffsets: Int32Array;
  carriesNextPixel: boolean;
  firstFarTap: number;
}

interface RowPass {
  y: number;
  direction: number;
  base: number;
  interiorRow: boolean;
}

const largestOf = (values: Int32Array): number => values.reduce((largest, value) => Math.max(largest, Math.abs(value)), 0);

export const openWindow = (method: DitherMethod, width: number): DiffusionWindow => {
  const { offsetsX, offsetsY, weights } = flattenKernel(method);
  const depth = largestOf(offsetsY);
  const rowStride = width * RGB_STRIDE;
  const carriesNextPixel = offsetsX[NEXT_PIXEL_TAP] === 1 && offsetsY[NEXT_PIXEL_TAP] === 0;
  return {
    offsetsX, offsetsY, weights, depth, rowStride, carriesNextPixel,
    reach: largestOf(offsetsX),
    slotCount: depth + 1,
    rows: new Float32Array((depth + 1) * rowStride),
    tapOffsets: new Int32Array(weights.length),
    firstFarTap: carriesNextPixel ? NEXT_PIXEL_TAP + 1 : NEXT_PIXEL_TAP,
  };
};

const slotStart = (window: DiffusionWindow, y: number): number => (y % window.slotCount) * window.rowStride;

export const loadRow = (data: Float32Array, width: number, window: DiffusionWindow, y: number): void => {
  const { rows } = window;
  const target = slotStart(window, y);
  const source = y * width * RGBA_STRIDE;
  for (let x = 0; x < width; x++) {
    rows[target + x * RGB_STRIDE] = srgbByteToLinear(data[source + x * RGBA_STRIDE]);
    rows[target + x * RGB_STRIDE + 1] = srgbByteToLinear(data[source + x * RGBA_STRIDE + 1]);
    rows[target + x * RGB_STRIDE + 2] = srgbByteToLinear(data[source + x * RGBA_STRIDE + 2]);
  }
};

export const startRow = (window: DiffusionWindow, y: number, height: number): RowPass => {
  const pass: RowPass = {
    y,
    direction: (y & 1) === 0 ? 1 : -1,
    base: slotStart(window, y),
    interiorRow: y + window.depth < height,
  };
  if (!pass.interiorRow) return pass;
  const { offsetsX, offsetsY, tapOffsets } = window;
  for (let tap = 0; tap < tapOffsets.length; tap++) {
    tapOffsets[tap] = slotStart(window, y + offsetsY[tap]) + offsetsX[tap] * pass.direction * RGB_STRIDE;
  }
  return pass;
};

export const spreadFarTaps = (window: DiffusionWindow, column: number, red: number, green: number, blue: number): void => {
  const { rows, weights, tapOffsets } = window;
  for (let tap = window.firstFarTap; tap < weights.length; tap++) {
    const target = tapOffsets[tap] + column;
    const weight = weights[tap];
    rows[target] += red * weight;
    rows[target + 1] += green * weight;
    rows[target + 2] += blue * weight;
  }
};

export const spreadChecked = (
  window: DiffusionWindow, pass: RowPass, x: number, size: { width: number; height: number },
  red: number, green: number, blue: number,
): void => {
  const { rows, offsetsX, offsetsY, weights } = window;
  for (let tap = 0; tap < weights.length; tap++) {
    const targetX = x + offsetsX[tap] * pass.direction;
    const targetY = pass.y + offsetsY[tap];
    if (targetX < 0 || targetX >= size.width || targetY >= size.height) continue;
    const target = slotStart(window, targetY) + targetX * RGB_STRIDE;
    const weight = weights[tap];
    rows[target] += red * weight;
    rows[target + 1] += green * weight;
    rows[target + 2] += blue * weight;
  }
};
