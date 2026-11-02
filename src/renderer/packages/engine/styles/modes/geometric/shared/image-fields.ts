import type { SourceImage } from "../../../engine/style-definition";
import { CHANNEL_MAX, CHANNELS, lumaOf } from "./colour";

export interface FieldGrid {
  data: Float32Array;
  width: number;
  height: number;
}

export interface GradientField {
  gx: Float32Array;
  gy: Float32Array;
  magnitude: Float32Array;
  max: number;
}

export const lumaField = (source: SourceImage): FieldGrid => {
  const data = new Float32Array(source.width * source.height);
  const pixels = source.data;
  for (let index = 0; index < data.length; index++) {
    const offset = index * CHANNELS;
    data[index] = lumaOf(pixels[offset], pixels[offset + 1], pixels[offset + 2]) / CHANNEL_MAX;
  }
  return { data, width: source.width, height: source.height };
};

export const fieldAt = (field: FieldGrid, x: number, y: number): number => {
  const column = Math.min(field.width - 1, Math.max(0, Math.round(x)));
  const row = Math.min(field.height - 1, Math.max(0, Math.round(y)));
  return field.data[row * field.width + column];
};

const sobelAt = (luma: Float32Array, width: number, index: number): [number, number] => {
  const up = index - width;
  const down = index + width;
  const gx = luma[up + 1] + 2 * luma[index + 1] + luma[down + 1] - luma[up - 1] - 2 * luma[index - 1] - luma[down - 1];
  const gy = luma[down - 1] + 2 * luma[down] + luma[down + 1] - luma[up - 1] - 2 * luma[up] - luma[up + 1];
  return [gx, gy];
};

export const sobelField = (field: FieldGrid): GradientField => {
  const { width, height, data } = field;
  const gx = new Float32Array(width * height);
  const gy = new Float32Array(width * height);
  const magnitude = new Float32Array(width * height);
  let max = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x;
      [gx[index], gy[index]] = sobelAt(data, width, index);
      magnitude[index] = Math.hypot(gx[index], gy[index]);
      if (magnitude[index] > max) max = magnitude[index];
    }
  }
  return { gx, gy, magnitude, max: Math.max(max, Number.EPSILON) };
};
