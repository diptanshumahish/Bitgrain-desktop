import type { SourceImage } from "../engine/style-definition";
import { centreIndex, forEachCell, type CellGrid, type Rgb } from "./cell-grid";
import { lumaOf } from "./cell-tone";

const SPREAD_WEIGHT = 1.1;
const CHANNEL_MAX = 255;
const GATE_POWER = 0.4;
const RAMP_POWER = 0.3;
const RAMP_GAIN = 0.6;
const COLOUR_GAIN = 2.5;
const MIN_EDGE = 0.05;

const cellLumas = (source: SourceImage, grid: CellGrid): Float32Array => {
  const lumas = new Float32Array(grid.columns * grid.rows);
  forEachCell(grid, (column, row) => {
    const index = centreIndex(source, grid, column, row);
    lumas[row * grid.columns + column] = lumaOf(source.data[index], source.data[index + 1], source.data[index + 2]) / CHANNEL_MAX;
  });
  return lumas;
};

const gradientAt = (lumas: Float32Array, grid: CellGrid, column: number, row: number): number => {
  const at = (x: number, y: number): number =>
    lumas[Math.min(grid.rows - 1, Math.max(0, y)) * grid.columns + Math.min(grid.columns - 1, Math.max(0, x))];
  const horizontal = at(column + 1, row - 1) + 2 * at(column + 1, row) + at(column + 1, row + 1)
    - at(column - 1, row - 1) - 2 * at(column - 1, row) - at(column - 1, row + 1);
  const vertical = at(column - 1, row + 1) + 2 * at(column, row + 1) + at(column + 1, row + 1)
    - at(column - 1, row - 1) - 2 * at(column, row - 1) - at(column + 1, row - 1);
  return Math.hypot(horizontal, vertical);
};

const thresholdFor = (strengths: Float32Array): number => {
  let sum = 0;
  let squares = 0;
  for (const value of strengths) {
    sum += value;
    squares += value * value;
  }
  const mean = sum / strengths.length;
  return mean + SPREAD_WEIGHT * Math.sqrt(Math.max(0, squares / strengths.length - mean * mean));
};

const normalise = (strengths: Float32Array, threshold: number): Float32Array => {
  let peak = 0;
  for (let index = 0; index < strengths.length; index++) {
    strengths[index] = Math.max(0, strengths[index] - threshold);
    peak = Math.max(peak, strengths[index]);
  }
  if (peak > 0) for (let index = 0; index < strengths.length; index++) strengths[index] /= peak;
  return strengths;
};

export const buildCellEdges = (source: SourceImage, grid: CellGrid): Float32Array => {
  const lumas = cellLumas(source, grid);
  const strengths = new Float32Array(lumas.length);
  forEachCell(grid, (column, row) => { strengths[row * grid.columns + column] = gradientAt(lumas, grid, column, row); });
  return normalise(strengths, thresholdFor(strengths));
};

export const edgeGateBoost = (edge: number, emphasis: number): number => Math.pow(edge, GATE_POWER) * emphasis;

export const edgeRampBoost = (edge: number, emphasis: number): number => RAMP_GAIN * Math.pow(edge, RAMP_POWER) * emphasis;

export const edgeLift = (colour: Rgb, edge: number, emphasis: number): Rgb => {
  if (edge <= MIN_EDGE) return colour;
  const amount = Math.min(1, edge * emphasis * COLOUR_GAIN);
  return [colour[0] + (CHANNEL_MAX - colour[0]) * amount, colour[1] + (CHANNEL_MAX - colour[1]) * amount, colour[2] + (CHANNEL_MAX - colour[2]) * amount];
};
