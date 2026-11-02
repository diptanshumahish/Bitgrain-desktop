import type { SourceImage } from "../engine/style-definition";
import type { ParamValues } from "../engine/style-types";
import { numberParam, toggleParam } from "../engine/resolve-params";
import { cellHash } from "../engine/seeded-random";
import { centreIndex, type CellGrid, type Rgb } from "./cell-grid";
import { FINISH_KEYS } from "./finish-params";

const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;
const CHANNEL_MAX = 255;
const CHANNEL_MID = 128;
const CONTRAST_PIVOT = 259;
const PERCENT = 100;
const LEVEL_SAMPLES = 40;
const COVERAGE_BUCKETS = 1000;
const COVERAGE_STEP = 10;
const DEFAULT_THRESHOLD = 30;

export const GATE_BASE_DENSE = 0.6;
export const GATE_BASE_LIGHT = 0.3;

export interface CellTone {
  lumaMin: number;
  lumaRange: number;
  contrastFactor: number;
  brightnessOffset: number;
  gate: number;
  rampShift: number;
  coverage: number;
  invert: boolean;
}

export const lumaOf = (red: number, green: number, blue: number): number =>
  LUMA_R * red + LUMA_G * green + LUMA_B * blue;

const measureLumaRange = (source: SourceImage, grid: CellGrid): [number, number] => {
  const step = Math.max(1, Math.floor(Math.min(grid.rows, grid.columns) / LEVEL_SAMPLES));
  let low = CHANNEL_MAX;
  let high = 0;
  for (let row = 0; row < grid.rows; row += step) {
    for (let column = 0; column < grid.columns; column += step) {
      const index = centreIndex(source, grid, column, row);
      const luma = lumaOf(source.data[index], source.data[index + 1], source.data[index + 2]);
      low = Math.min(low, luma);
      high = Math.max(high, luma);
    }
  }
  return [low, high - low || 1];
};

const contrastFactorFor = (contrast: number): number =>
  (CONTRAST_PIVOT * (contrast + CHANNEL_MAX)) / (CHANNEL_MAX * (CONTRAST_PIVOT - contrast));

export const buildCellTone = (source: SourceImage, grid: CellGrid, params: ParamValues, gateBase: number): CellTone => {
  const [lumaMin, lumaRange] = measureLumaRange(source, grid);
  const threshold = numberParam(params, FINISH_KEYS.threshold);
  return {
    lumaMin,
    lumaRange,
    contrastFactor: contrastFactorFor(numberParam(params, FINISH_KEYS.contrast)),
    brightnessOffset: (CHANNEL_MAX * numberParam(params, FINISH_KEYS.brightness)) / PERCENT,
    gate: gateBase * (1 - threshold / PERCENT),
    rampShift: (threshold - DEFAULT_THRESHOLD) / PERCENT,
    coverage: numberParam(params, FINISH_KEYS.coverage),
    invert: toggleParam(params, FINISH_KEYS.invert),
  };
};

export const toneOf = (tone: CellTone, luma: number): number => {
  const level = Math.min(1, Math.max(0, (luma - tone.lumaMin) / tone.lumaRange));
  return tone.invert ? 1 - level : level;
};

const adjustChannel = (tone: CellTone, value: number): number =>
  Math.min(CHANNEL_MAX, Math.max(0, tone.contrastFactor * (value - CHANNEL_MID) + CHANNEL_MID + tone.brightnessOffset));

export const adjustColour = (tone: CellTone, colour: Rgb): Rgb =>
  [adjustChannel(tone, colour[0]), adjustChannel(tone, colour[1]), adjustChannel(tone, colour[2])];

export const invertColour = (colour: Rgb): Rgb =>
  [CHANNEL_MAX - colour[0], CHANNEL_MAX - colour[1], CHANNEL_MAX - colour[2]];

export const thinnedByCoverage = (tone: CellTone, column: number, row: number): boolean =>
  tone.coverage < PERCENT && cellHash(column, row) % COVERAGE_BUCKETS > COVERAGE_STEP * tone.coverage;

export const culledByBrightness = (tone: CellTone, level: number): boolean =>
  tone.coverage < PERCENT && level < 1 - tone.coverage / PERCENT;

export const rgbaOf = (colour: Rgb, alpha: number): string =>
  `rgba(${Math.round(colour[0])},${Math.round(colour[1])},${Math.round(colour[2])},${alpha})`;
