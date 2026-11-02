import { dotRadiusFor } from "./halftone-coverage";
import { sampleBilinear, type Rgb } from "./sample-bilinear";
import type { HalftoneShape } from "./halftone-defaults";

const DEGREES_TO_RADIANS = Math.PI / 180;
const GRID_MARGIN_CELLS = 2;

export type InkResolver = (sample: Rgb, colourOut: Rgb) => number;

export interface CellGrid {
  cosA: number;
  sinA: number;
  reach: number;
  span: number;
  radius: Float32Array;
  colour: Float32Array;
}

export interface GridRequest {
  source: Float32Array;
  width: number;
  height: number;
  cellPx: number;
  angleDegrees: number;
  intensity: number;
  shape: HalftoneShape;
  resolveInk: InkResolver;
}

export const buildCellGrid = (request: GridRequest): CellGrid => {
  const { source, width, height, cellPx } = request;
  const cosA = Math.cos(request.angleDegrees * DEGREES_TO_RADIANS);
  const sinA = Math.sin(request.angleDegrees * DEGREES_TO_RADIANS);
  const reach = Math.ceil(Math.hypot(width, height) / 2 / cellPx) + GRID_MARGIN_CELLS;
  const span = reach * 2 + 1;
  const radius = new Float32Array(span * span);
  const colour = new Float32Array(span * span * 3);
  const sample: Rgb = [0, 0, 0];
  const ink: Rgb = [0, 0, 0];
  for (let row = -reach; row <= reach; row++) {
    for (let col = -reach; col <= reach; col++) {
      const centerX = width / 2 + (col * cosA - row * sinA) * cellPx;
      const centerY = height / 2 + (col * sinA + row * cosA) * cellPx;
      sampleBilinear(source, width, height, centerX, centerY, sample);
      const density = Math.min(1, Math.max(0, request.resolveInk(sample, ink) * request.intensity));
      const cell = (row + reach) * span + (col + reach);
      radius[cell] = dotRadiusFor(density, cellPx, request.shape);
      colour[cell * 3] = ink[0];
      colour[cell * 3 + 1] = ink[1];
      colour[cell * 3 + 2] = ink[2];
    }
  }
  return { cosA, sinA, reach, span, radius, colour };
};
