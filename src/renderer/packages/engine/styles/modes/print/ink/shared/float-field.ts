import type { SourceImage } from "../../../../engine/style-definition";

export const LUMA_RED = 0.299;
export const LUMA_GREEN = 0.587;
export const LUMA_BLUE = 0.114;
export const CHANNEL_MAX = 255;
export const CHANNELS = 4;

export interface FloatField {
  values: Float32Array;
  width: number;
  height: number;
}

export const lumaField = (source: SourceImage): FloatField => {
  const values = new Float32Array(source.width * source.height);
  const data = source.data;
  for (let index = 0; index < values.length; index++) {
    const offset = index * CHANNELS;
    values[index] = (LUMA_RED * data[offset] + LUMA_GREEN * data[offset + 1] + LUMA_BLUE * data[offset + 2]) / CHANNEL_MAX;
  }
  return { values, width: source.width, height: source.height };
};

export const fieldAt = (field: FloatField, x: number, y: number): number => {
  const column = x < 0 ? 0 : x >= field.width ? field.width - 1 : x | 0;
  const row = y < 0 ? 0 : y >= field.height ? field.height - 1 : y | 0;
  return field.values[row * field.width + column];
};

const blurRun = (
  source: Float32Array, target: Float32Array, start: number, stride: number, length: number, radius: number,
): void => {
  const span = radius * 2 + 1;
  const last = length - 1;
  let sum = 0;
  for (let offset = -radius; offset <= radius; offset++) sum += source[start + Math.min(last, Math.max(0, offset)) * stride];
  for (let index = 0; index < length; index++) {
    target[start + index * stride] = sum / span;
    const entering = Math.min(last, index + radius + 1);
    const leaving = Math.max(0, index - radius);
    sum += source[start + entering * stride] - source[start + leaving * stride];
  }
};

export const boxBlurField = (field: FloatField, radius: number): FloatField => {
  const { width, height } = field;
  const whole = Math.round(radius);
  if (whole < 1) return { values: new Float32Array(field.values), width, height };
  const scratch = new Float32Array(field.values.length);
  const values = new Float32Array(field.values.length);
  for (let row = 0; row < height; row++) blurRun(field.values, scratch, row * width, 1, width, whole);
  for (let column = 0; column < width; column++) blurRun(scratch, values, column, width, height, whole);
  return { values, width, height };
};
