import { frameFromPixels } from "../../../../engine/frame";
import type { SourceImage } from "../../../../engine/style-definition";
import { BYTE_MAX, CHANNELS, lumaOf } from "../../shared/signal-math";

const CELL_MIN_PX = 4;
const CELL_FLOOR = 3;
const CELL_STRETCH = 1.4;
const CELL_BASE = 4;
const CELL_RANGE = 24;
const REFERENCE_WIDTH = 900;

export interface BeaconGrid {
  columns: number;
  rows: number;
  cell: number;
  colour: Uint8ClampedArray;
  luma: Float32Array;
}

export const beaconCellSize = (width: number, size: number): number =>
  Math.max(CELL_MIN_PX, CELL_STRETCH * Math.max(CELL_FLOOR, Math.round((width / REFERENCE_WIDTH) * (CELL_BASE + CELL_RANGE * size))));

export const beaconGrid = (source: SourceImage, cell: number): BeaconGrid => {
  const columns = Math.max(1, Math.ceil(source.width / cell));
  const rows = Math.max(1, Math.ceil(source.height / cell));
  const canvas = new OffscreenCanvas(columns, rows);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");
  context.imageSmoothingQuality = "high";
  context.drawImage(frameFromPixels(source.data, source.width, source.height).canvas, 0, 0, columns * cell, rows * cell, 0, 0, columns, rows);
  const colour = context.getImageData(0, 0, columns, rows).data;
  const luma = new Float32Array(columns * rows);
  for (let index = 0; index < luma.length; index++) {
    luma[index] = lumaOf(colour[index * CHANNELS], colour[index * CHANNELS + 1], colour[index * CHANNELS + 2]) / BYTE_MAX;
  }
  return { columns, rows, cell, colour, luma };
};

export const uphillAngle = (grid: BeaconGrid): number => {
  let sumX = 0;
  let sumY = 0;
  for (let row = 1; row < grid.rows - 1; row++) {
    for (let column = 1; column < grid.columns - 1; column++) {
      const index = row * grid.columns + column;
      sumX -= (grid.luma[index + 1] - grid.luma[index - 1]) * grid.luma[index];
      sumY -= (grid.luma[index + grid.columns] - grid.luma[index - grid.columns]) * grid.luma[index];
    }
  }
  return Math.atan2(sumY, sumX);
};
