import type { SelectOption } from "../../../../engine/style-types";
import { clampUnit, fract } from "../shared/screen-math";
import { boxDistance, triangleDistance } from "./halftone-shapes";

export interface ScreenPoint {
  gridX: number;
  gridY: number;
  localX: number;
  localY: number;
  column: number;
  row: number;
}

type ScreenThreshold = (point: ScreenPoint) => number;

const TRIANGLE_ZOOM = 1.7;
const TRIANGLE_GAIN = 0.7;
const DASH_THICKNESS = 2.6;
const DASH_GAP = 0.35;
const RING_COUNT = 4;
const PLUS_ZOOM = 2;
const PLUS_HALF = 0.34;
const PLUS_GAIN = 0.9;

const chebyshev = (point: ScreenPoint): number => 2 * Math.max(Math.abs(point.localX), Math.abs(point.localY));
const diagonalBand = (value: number): number => 2 * Math.abs(fract(value) - 0.5);
const plusDistance = (x: number, y: number): number => Math.min(boxDistance(x, y, 1, PLUS_HALF), boxDistance(x, y, PLUS_HALF, 1));

const brickThreshold: ScreenThreshold = (point) => {
  const shiftedX = fract(point.gridX + (point.row % 2 === 0 ? 0 : 0.5)) - 0.5;
  return 1 - 2 * Math.max(Math.abs(shiftedX), Math.abs(point.localY));
};

const SCREEN_THRESHOLDS: Readonly<Record<string, ScreenThreshold>> = {
  checker: (point) => ((point.column + point.row) % 2 === 0 ? chebyshev(point) : 1 - chebyshev(point)),
  stripesV: (point) => 2 * Math.abs(point.localX),
  stripesH: (point) => 2 * Math.abs(point.localY),
  diagonal: (point) => diagonalBand(point.gridX + point.gridY),
  crosshatch: (point) => Math.min(diagonalBand(point.gridX + point.gridY), diagonalBand(point.gridX - point.gridY)),
  grid: (point) => 1 - chebyshev(point),
  brick: brickThreshold,
  triangle: (point) => clampUnit(triangleDistance(TRIANGLE_ZOOM * point.localX, TRIANGLE_ZOOM * point.localY) * TRIANGLE_GAIN + 0.5),
  dash: (point) => Math.max(DASH_THICKNESS * Math.abs(point.localY), diagonalBand(point.gridX) - DASH_GAP),
  rings: (point) => diagonalBand(RING_COUNT * Math.hypot(point.localX, point.localY)),
  plus: (point) => clampUnit(plusDistance(PLUS_ZOOM * point.localX, PLUS_ZOOM * point.localY) * PLUS_GAIN + 0.5),
};

export const DOTS_TEXTURE = "dots";

export const TEXTURE_OPTIONS: readonly SelectOption[] = [
  { value: DOTS_TEXTURE, label: "Dots" },
  { value: "checker", label: "Checker" },
  { value: "stripesV", label: "Vertical stripes" },
  { value: "stripesH", label: "Horizontal stripes" },
  { value: "diagonal", label: "Diagonal" },
  { value: "crosshatch", label: "Crosshatch" },
  { value: "grid", label: "Grid" },
  { value: "brick", label: "Brick" },
  { value: "triangle", label: "Triangles" },
  { value: "dash", label: "Dashes" },
  { value: "rings", label: "Rings" },
  { value: "plus", label: "Plus" },
];

export const screenThresholdFor = (texture: string): ScreenThreshold => SCREEN_THRESHOLDS[texture] ?? SCREEN_THRESHOLDS.grid;
