import type { SourceImage } from "../../../../engine/style-definition";

const CHANNELS = 4;
const SAMPLE_TARGET = 40000;
const HISTOGRAM_SIZE = 256;
const LOW_PERCENTILE = 0.01;
const HIGH_PERCENTILE = 0.99;
const MEDIAN_PERCENTILE = 0.5;
const MIDTONE_TARGET = 0.5;
const MIN_EXPONENT = 0.4;
const MAX_EXPONENT = 1.5;
const MIN_RANGE = 24;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

export interface StudioLevels {
  lumaMin: number;
  lumaRange: number;
  midExponent: number;
}

const lumaHistogram = (source: SourceImage): Uint32Array => {
  const histogram = new Uint32Array(HISTOGRAM_SIZE);
  const pixelCount = source.width * source.height;
  const stride = Math.max(1, Math.floor(pixelCount / SAMPLE_TARGET));
  for (let pixel = 0; pixel < pixelCount; pixel += stride) {
    const index = pixel * CHANNELS;
    const luma = LUMA_R * source.data[index] + LUMA_G * source.data[index + 1] + LUMA_B * source.data[index + 2];
    histogram[Math.min(HISTOGRAM_SIZE - 1, Math.round(luma))] += 1;
  }
  return histogram;
};

const percentileOf = (histogram: Uint32Array, total: number, fraction: number): number => {
  const target = total * fraction;
  let running = 0;
  for (let bin = 0; bin < HISTOGRAM_SIZE; bin++) {
    running += histogram[bin];
    if (running >= target) return bin;
  }
  return HISTOGRAM_SIZE - 1;
};

const exponentFor = (median: number): number => {
  const clamped = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, median));
  return Math.min(MAX_EXPONENT, Math.max(MIN_EXPONENT, Math.log(MIDTONE_TARGET) / Math.log(clamped)));
};

export const measureStudioLevels = (source: SourceImage): StudioLevels => {
  const histogram = lumaHistogram(source);
  const total = histogram.reduce((sum, count) => sum + count, 0);
  const low = percentileOf(histogram, total, LOW_PERCENTILE);
  const high = percentileOf(histogram, total, HIGH_PERCENTILE);
  const range = Math.max(MIN_RANGE, high - low);
  const median = (percentileOf(histogram, total, MEDIAN_PERCENTILE) - low) / range;
  return { lumaMin: low, lumaRange: range, midExponent: exponentFor(median) };
};
