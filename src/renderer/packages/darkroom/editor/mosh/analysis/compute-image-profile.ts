import type { ImageProfile } from "./image-profile";
import type { SampledPixels } from "./sample-image-pixels";

const CHANNELS = 4;
const MAX_CHANNEL = 255;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;
const DETAIL_FULL_SCALE = 0.08;

const toLumaMap = (pixels: SampledPixels): Float32Array => {
  const luma = new Float32Array(pixels.width * pixels.height);
  for (let index = 0; index < luma.length; index++) {
    const offset = index * CHANNELS;
    const { data } = pixels;
    luma[index] = (data[offset] * LUMA_R + data[offset + 1] * LUMA_G + data[offset + 2] * LUMA_B) / MAX_CHANNEL;
  }
  return luma;
};

const averageOf = (values: Float32Array): number => {
  let total = 0;
  for (const value of values) total += value;
  return total / Math.max(1, values.length);
};

const spreadOf = (values: Float32Array, mean: number): number => {
  let variance = 0;
  for (const value of values) variance += (value - mean) ** 2;
  return Math.sqrt(variance / Math.max(1, values.length));
};

const averageSaturation = (data: Uint8ClampedArray): number => {
  let total = 0;
  for (let offset = 0; offset < data.length; offset += CHANNELS) {
    const high = Math.max(data[offset], data[offset + 1], data[offset + 2]);
    const low = Math.min(data[offset], data[offset + 1], data[offset + 2]);
    total += high === 0 ? 0 : (high - low) / high;
  }
  return total / Math.max(1, data.length / CHANNELS);
};

const detailOf = (luma: Float32Array, width: number, height: number): number => {
  let total = 0;
  let count = 0;
  for (let row = 0; row < height - 1; row++) {
    for (let col = 0; col < width - 1; col++) {
      const index = row * width + col;
      total += Math.abs(luma[index] - luma[index + 1]) + Math.abs(luma[index] - luma[index + width]);
      count += 2;
    }
  }
  return Math.min(1, total / Math.max(1, count) / DETAIL_FULL_SCALE);
};

export const computeImageProfile = (pixels: SampledPixels): ImageProfile => {
  const luma = toLumaMap(pixels);
  const meanLuma = averageOf(luma);
  return {
    meanLuma,
    lumaSpread: spreadOf(luma, meanLuma),
    meanSaturation: averageSaturation(pixels.data),
    detail: detailOf(luma, pixels.width, pixels.height),
  };
};
