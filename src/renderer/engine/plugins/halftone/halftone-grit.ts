import { valueNoise } from "../ink-common";

const EDGE_FREQUENCY_PER_CELL = 3;
const EDGE_DETAIL_FREQUENCY_PER_CELL = 9;
const EDGE_SHIFT_PER_CELL = 0.32;
const DETAIL_WEIGHT = 0.6;
const FLECK_FREQUENCY = 0.9;
const FLECK_THRESHOLD = 0.55;
const FLECK_STRENGTH = 0.85;
const SPECK_THRESHOLD = 0.93;
const SPECK_STRENGTH = 0.8;
const SPECK_FREQUENCY = 0.45;
const SPECK_OFFSET = 4096;

export const gritEdgeShift = (x: number, y: number, cellPx: number, grit: number): number => {
  if (grit <= 0) return 0;
  const coarse = valueNoise(x, y, EDGE_FREQUENCY_PER_CELL / cellPx) - 0.5;
  const detail = valueNoise(y, x, EDGE_DETAIL_FREQUENCY_PER_CELL / cellPx) - 0.5;
  return (coarse + detail * DETAIL_WEIGHT) * 2 * EDGE_SHIFT_PER_CELL * cellPx * grit;
};

export const gritInkFactor = (x: number, y: number, grit: number): number => {
  if (grit <= 0) return 1;
  const fleck = valueNoise(x, y, FLECK_FREQUENCY);
  if (fleck <= FLECK_THRESHOLD) return 1;
  return 1 - ((fleck - FLECK_THRESHOLD) / (1 - FLECK_THRESHOLD)) * FLECK_STRENGTH * grit;
};

export const gritPaperSpeck = (x: number, y: number, grit: number): number => {
  if (grit <= 0) return 0;
  const speck = valueNoise(x + SPECK_OFFSET, y + SPECK_OFFSET, SPECK_FREQUENCY);
  if (speck <= SPECK_THRESHOLD) return 0;
  return ((speck - SPECK_THRESHOLD) / (1 - SPECK_THRESHOLD)) * SPECK_STRENGTH * grit;
};
