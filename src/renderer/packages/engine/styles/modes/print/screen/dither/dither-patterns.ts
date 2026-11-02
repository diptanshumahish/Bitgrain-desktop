import type { SelectOption } from "../../../../engine/style-types";
import { bayerThresholds } from "../../../../../plugins/dither/bayer-matrix";
import { BLUE_NOISE_SIZE, blueNoiseAt } from "../../../../../plugins/dither/blue-noise-mask";
import { CHANNEL_MAX } from "../shared/screen-math";

interface PatternSettings {
  algorithm: string;
  cellSize: number;
  angle: number;
}

const BASE_CELL = 8;
const MIN_SUB_CELL = 0.1;
const MIN_LINE_CELL = 2;
const RADIAL_REACH = 0.707;
const NOISE_PRIME_X = 73856093;
const NOISE_PRIME_Y = 19349663;
const NOISE_MIX = 1274126177;
const NOISE_SHIFT_A = 13;
const NOISE_SHIFT_B = 16;
const LOW_BYTE = 0xff;
const CLUSTER_SIZE = 8;
const CLUSTER_TABLE = [
  24, 10, 12, 26, 35, 47, 49, 37, 8, 0, 2, 14, 45, 59, 61, 51, 22, 6, 4, 16, 43, 57, 63, 53,
  30, 20, 18, 28, 33, 41, 55, 39, 34, 46, 48, 36, 25, 11, 13, 27, 44, 58, 60, 50, 9, 1, 3, 15,
  42, 56, 62, 52, 23, 7, 5, 17, 32, 40, 54, 38, 31, 21, 19, 29,
];
const BAYER_SIZES: Readonly<Record<string, number>> = { bayer2: 2, bayer4: 4, bayer8: 8, bayer16: 16 };

export const ORDERED_OPTIONS: readonly SelectOption[] = [
  { value: "bayer2", label: "Bayer 2x2" },
  { value: "bayer4", label: "Bayer 4x4" },
  { value: "bayer8", label: "Bayer 8x8" },
  { value: "bayer16", label: "Bayer 16x16" },
  { value: "halftone", label: "Clustered dot" },
  { value: "radial", label: "Radial" },
  { value: "linesH", label: "Horizontal lines" },
  { value: "linesV", label: "Vertical lines" },
  { value: "linesD", label: "Diagonal lines" },
  { value: "whiteNoise", label: "White noise" },
  { value: "blueNoise", label: "Blue noise" },
];

const wrap = (value: number, size: number): number => ((value % size) + size) % size;

const whiteNoiseAt = (x: number, y: number): number => {
  let mixed = Math.imul(NOISE_PRIME_X, x) ^ Math.imul(NOISE_PRIME_Y, y);
  mixed = Math.imul(mixed ^ (mixed >>> NOISE_SHIFT_A), NOISE_MIX);
  return (mixed ^ (mixed >>> NOISE_SHIFT_B)) & LOW_BYTE;
};

const clusteredAt = (column: number, row: number): number =>
  ((CLUSTER_TABLE[wrap(row, CLUSTER_SIZE) * CLUSTER_SIZE + wrap(column, CLUSTER_SIZE)] + 0.5) / (CLUSTER_SIZE * CLUSTER_SIZE)) * CHANNEL_MAX;

const subCellPattern = (settings: PatternSettings): ((x: number, y: number) => number) => {
  const subCell = Math.max(MIN_SUB_CELL, settings.cellSize) / BASE_CELL;
  const bayerSize = BAYER_SIZES[settings.algorithm];
  const bayer = bayerSize ? bayerThresholds(bayerSize) : null;
  return (x, y) => {
    const column = Math.floor(x / subCell);
    const row = Math.floor(y / subCell);
    if (bayer) return bayer[wrap(row, bayerSize) * bayerSize + wrap(column, bayerSize)] * CHANNEL_MAX;
    if (settings.algorithm === "halftone") return clusteredAt(column, row);
    if (settings.algorithm === "whiteNoise") return whiteNoiseAt(column, row);
    return blueNoiseAt(wrap(column, BLUE_NOISE_SIZE), wrap(row, BLUE_NOISE_SIZE)) * CHANNEL_MAX;
  };
};

const linePattern = (settings: PatternSettings): ((x: number, y: number) => number) => {
  const cell = Math.max(MIN_LINE_CELL, Math.floor(settings.cellSize));
  const cosine = Math.cos(settings.angle);
  const sine = Math.sin(settings.angle);
  if (settings.algorithm === "linesH") return (_x, y) => (wrap(y, cell) * CHANNEL_MAX) / cell;
  if (settings.algorithm === "linesV") return (x) => (wrap(x, cell) * CHANNEL_MAX) / cell;
  if (settings.algorithm === "linesD") return (x, y) => (wrap(x + y, cell) * CHANNEL_MAX) / cell;
  return (x, y) => {
    const localX = wrap(x * cosine - y * sine, cell) - cell / 2;
    const localY = wrap(x * sine + y * cosine, cell) - cell / 2;
    return Math.min(CHANNEL_MAX, (Math.hypot(localX, localY) / (RADIAL_REACH * cell)) * CHANNEL_MAX);
  };
};

const isLineFamily = (algorithm: string): boolean => algorithm === "radial" || algorithm.startsWith("lines");

export const buildPatternField = (settings: PatternSettings, width: number, height: number): Float32Array => {
  const patternAt = isLineFamily(settings.algorithm) ? linePattern(settings) : subCellPattern(settings);
  const field = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) field[y * width + x] = patternAt(x, y);
  }
  return field;
};
