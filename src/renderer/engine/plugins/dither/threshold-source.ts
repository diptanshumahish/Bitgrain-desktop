import type { DitherMethod } from "../../types";
import { bayerThresholds } from "./bayer-matrix";
import { blueNoiseMask, BLUE_NOISE_SIZE } from "./blue-noise-mask";
import { createSeededRandom } from "../../utils/seeded-random";

export type ThresholdAt = (x: number, y: number) => number;

const BAYER_SIZES: Partial<Record<DitherMethod, number>> = { "bayer-2": 2, "bayer-4": 4, "bayer-8": 8 };
const CENTER_THRESHOLD = 0.5;

const tiledThreshold = (table: Float32Array, size: number): ThresholdAt =>
  (x, y) => table[(y % size) * size + (x % size)];

const randomThreshold = (seed: number): ThresholdAt => {
  const random = createSeededRandom(seed);
  return () => random();
};

export const isOrderedMethod = (method: DitherMethod): boolean =>
  method === "threshold" || method === "random" || method === "blue-noise" || method in BAYER_SIZES;

export const thresholdSourceFor = (method: DitherMethod, seed: number): ThresholdAt => {
  const bayerSize = BAYER_SIZES[method];
  if (bayerSize) return tiledThreshold(bayerThresholds(bayerSize), bayerSize);
  if (method === "blue-noise") return tiledThreshold(blueNoiseMask(), BLUE_NOISE_SIZE);
  if (method === "random") return randomThreshold(seed);
  return () => CENTER_THRESHOLD;
};
