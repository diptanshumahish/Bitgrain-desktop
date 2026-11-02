import type { PixelBuffer } from "../warp/warp-sampler";

const CHANNELS = 4;

export interface PixelShift {
  shiftX: number;
  shiftY: number;
}

const addShiftedRow = (source: PixelBuffer, sums: Uint32Array, y: number, shift: PixelShift): void => {
  const { data, width, height } = source;
  const sourceRow = Math.min(height - 1, Math.max(0, y + shift.shiftY)) * width;
  const targetRow = y * width;
  for (let x = 0; x < width; x++) {
    const sourceIndex = (sourceRow + Math.min(width - 1, Math.max(0, x + shift.shiftX))) * CHANNELS;
    const targetIndex = (targetRow + x) * CHANNELS;
    sums[targetIndex] += data[sourceIndex];
    sums[targetIndex + 1] += data[sourceIndex + 1];
    sums[targetIndex + 2] += data[sourceIndex + 2];
    sums[targetIndex + 3] += data[sourceIndex + 3];
  }
};

export const averageShifts = (source: PixelBuffer, shifts: readonly PixelShift[], target: Uint8ClampedArray): void => {
  const sums = new Uint32Array(source.data.length);
  for (const shift of shifts) {
    for (let y = 0; y < source.height; y++) addShiftedRow(source, sums, y, shift);
  }
  const count = Math.max(1, shifts.length);
  for (let index = 0; index < sums.length; index++) target[index] = sums[index] / count;
};

