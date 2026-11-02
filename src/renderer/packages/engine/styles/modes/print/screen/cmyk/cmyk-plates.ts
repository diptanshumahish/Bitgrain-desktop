import type { SourceImage } from "../../../../engine/style-definition";
import { latticeHash } from "../shared/value-noise";
import { levelledRgb } from "./cmyk-levels";
import { DEGREES_TO_RADIANS, clampToGrid, clampUnit } from "../shared/screen-math";

export const PLATE_COUNT = 4;
const PLATE_ANGLES = [15, 75, 0, 45];
const PLATE_SHIFTS = [-0.5, -0.25, 0.2, 0];
const PLATE_SEEDS = [11, 23, 37, 51];
const JITTER_SEED_STEP = 7;
const HALF = 0.5;
const RGB = 3;
const BLACK_CURVE = 1.35;

export interface PlateGrid {
  cosine: number;
  sine: number;
  shift: number;
  columnMin: number;
  rowMin: number;
  columns: number;
  rows: number;
  centreX: Float32Array;
  centreY: Float32Array;
  value: Float32Array;
}

export interface PlateFrame {
  width: number;
  height: number;
  cell: number;
  gridNoise: number;
}

export const inkChannels = (source: SourceImage, contrast: number): Float32Array => {
  const count = source.width * source.height;
  const channels = new Float32Array(count * PLATE_COUNT);
  const levelled = levelledRgb(source);
  const rgb = [0, 0, 0];
  for (let pixel = 0; pixel < count; pixel++) {
    for (let channel = 0; channel < 3; channel++) rgb[channel] = clampUnit((levelled[pixel * RGB + channel] - HALF) * contrast + HALF);
    const brightest = Math.max(rgb[0], rgb[1], rgb[2]);
    const offset = pixel * PLATE_COUNT;
    for (let channel = 0; channel < 3; channel++) channels[offset + channel] = brightest > 0 ? (brightest - rgb[channel]) / brightest : 0;
    channels[offset + 3] = Math.pow(1 - brightest, BLACK_CURVE);
  }
  return channels;
};

const toPlateX = (grid: PlateGrid, frame: PlateFrame, x: number, y: number): number =>
  ((x - frame.width / 2) * grid.cosine + (y - frame.height / 2) * grid.sine) / frame.cell + grid.shift;

const toPlateY = (grid: PlateGrid, frame: PlateFrame, x: number, y: number): number =>
  ((y - frame.height / 2) * grid.cosine - (x - frame.width / 2) * grid.sine) / frame.cell + grid.shift;

const plateBounds = (grid: PlateGrid, frame: PlateFrame): void => {
  const corners = [[0, 0], [frame.width, 0], [0, frame.height], [frame.width, frame.height]];
  const xs = corners.map(([x, y]) => toPlateX(grid, frame, x, y));
  const ys = corners.map(([x, y]) => toPlateY(grid, frame, x, y));
  grid.columnMin = Math.floor(Math.min(...xs)) - 1;
  grid.rowMin = Math.floor(Math.min(...ys)) - 1;
  grid.columns = Math.floor(Math.max(...xs)) + 2 - grid.columnMin + 1;
  grid.rows = Math.floor(Math.max(...ys)) + 2 - grid.rowMin + 1;
};

const sampleCentre = (grid: PlateGrid, frame: PlateFrame, channels: Float32Array, plate: number, cell: number): number => {
  const gridX = grid.centreX[cell] - grid.shift;
  const gridY = grid.centreY[cell] - grid.shift;
  const x = frame.width / 2 + frame.cell * (gridX * grid.cosine - gridY * grid.sine);
  const y = frame.height / 2 + frame.cell * (gridX * grid.sine + gridY * grid.cosine);
  return channels[(clampToGrid(y, frame.height) * frame.width + clampToGrid(x, frame.width)) * PLATE_COUNT + plate];
};

const fillCells = (grid: PlateGrid, frame: PlateFrame, channels: Float32Array, plate: number): void => {
  const seed = PLATE_SEEDS[plate];
  for (let cell = 0; cell < grid.columns * grid.rows; cell++) {
    const column = grid.columnMin + (cell % grid.columns);
    const row = grid.rowMin + Math.floor(cell / grid.columns);
    grid.centreX[cell] = column + HALF + (latticeHash(column, row, seed) - HALF) * frame.gridNoise;
    grid.centreY[cell] = row + HALF + (latticeHash(column, row, seed + JITTER_SEED_STEP) - HALF) * frame.gridNoise;
    grid.value[cell] = sampleCentre(grid, frame, channels, plate, cell);
  }
};

export const buildPlateGrid = (frame: PlateFrame, channels: Float32Array, plate: number): PlateGrid => {
  const angle = PLATE_ANGLES[plate] * DEGREES_TO_RADIANS;
  const empty = new Float32Array(0);
  const grid: PlateGrid = { cosine: Math.cos(angle), sine: Math.sin(angle), shift: PLATE_SHIFTS[plate], columnMin: 0, rowMin: 0, columns: 0, rows: 0, centreX: empty, centreY: empty, value: empty };
  plateBounds(grid, frame);
  const count = grid.columns * grid.rows;
  grid.centreX = new Float32Array(count);
  grid.centreY = new Float32Array(count);
  grid.value = new Float32Array(count);
  fillCells(grid, frame, channels, plate);
  return grid;
};
