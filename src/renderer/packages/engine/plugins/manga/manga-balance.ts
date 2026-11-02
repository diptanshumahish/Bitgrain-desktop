import { measureLevels } from "../../tone/auto-levels";

const MEDIAN_FRACTION = 0.5;
const TARGET_MIDTONE = 0.5;
const BALANCE_STRENGTH = 0.6;
const MIN_GAMMA = 0.45;
const MAX_GAMMA = 2.2;
const SAFE_MEDIAN_LOW = 0.02;
const SAFE_MEDIAN_HIGH = 0.98;

const gammaForMedian = (median: number): number => {
  const safeMedian = Math.min(SAFE_MEDIAN_HIGH, Math.max(SAFE_MEDIAN_LOW, median));
  const target = safeMedian + (TARGET_MIDTONE - safeMedian) * BALANCE_STRENGTH;
  const gamma = Math.log(target) / Math.log(safeMedian);
  return Math.min(MAX_GAMMA, Math.max(MIN_GAMMA, gamma));
};

export const balanceMidtonesInPlace = (values: Float32Array): void => {
  const gamma = gammaForMedian(measureLevels(values, MEDIAN_FRACTION).low);
  for (let index = 0; index < values.length; index++) values[index] = Math.pow(values[index], gamma);
};
