import { clampUnit } from "./screen-math";

const BINS = 256;
const SAMPLE_TARGET = 60000;
const LOW_PERCENTILE = 0.01;
const HIGH_PERCENTILE = 0.99;
const MEDIAN_PERCENTILE = 0.5;
const MIN_EXPONENT = 0.45;
const MAX_EXPONENT = 1.6;
const MIN_SPAN = 0.08;

export interface PlaneLevels {
  low: number;
  span: number;
  exponent: number;
}

const histogramOf = (plane: Float32Array): Uint32Array => {
  const histogram = new Uint32Array(BINS);
  const stride = Math.max(1, Math.floor(plane.length / SAMPLE_TARGET));
  for (let index = 0; index < plane.length; index += stride) {
    histogram[Math.min(BINS - 1, Math.max(0, Math.round(plane[index] * (BINS - 1))))] += 1;
  }
  return histogram;
};

const percentileOf = (histogram: Uint32Array, total: number, fraction: number): number => {
  const target = total * fraction;
  let running = 0;
  for (let bin = 0; bin < BINS; bin++) {
    running += histogram[bin];
    if (running >= target) return bin / (BINS - 1);
  }
  return 1;
};

export const measurePlaneLevels = (plane: Float32Array, midtoneTarget: number): PlaneLevels => {
  const histogram = histogramOf(plane);
  const total = histogram.reduce((sum, count) => sum + count, 0);
  const low = percentileOf(histogram, total, LOW_PERCENTILE);
  const span = Math.max(MIN_SPAN, percentileOf(histogram, total, HIGH_PERCENTILE) - low);
  const median = Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, (percentileOf(histogram, total, MEDIAN_PERCENTILE) - low) / span));
  const exponent = Math.min(MAX_EXPONENT, Math.max(MIN_EXPONENT, Math.log(midtoneTarget) / Math.log(median)));
  return { low, span, exponent };
};

export const applyPlaneLevels = (plane: Float32Array, levels: PlaneLevels): Float32Array => {
  for (let index = 0; index < plane.length; index++) {
    plane[index] = Math.pow(clampUnit((plane[index] - levels.low) / levels.span), levels.exponent);
  }
  return plane;
};

export const autoLevelPlane = (plane: Float32Array, midtoneTarget: number): Float32Array =>
  applyPlaneLevels(plane, measurePlaneLevels(plane, midtoneTarget));
