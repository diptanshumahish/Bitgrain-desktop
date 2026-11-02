import type { HalftoneShape, HalftoneStyle } from "./halftone-defaults";
import type { Rgb } from "./sample-bilinear";
import type { CellGrid } from "./cell-grid";

export interface ScreenJob {
  source: Float32Array;
  width: number;
  height: number;
  outScale: number;
  cellPx: number;
  edgeWidth: number;
  angleWobble: number;
  baseAngle: number;
  style: HalftoneStyle;
  shape: HalftoneShape;
  intensity: number;
  grit: number;
  invert: boolean;
  paper?: Rgb;
}

export interface ScreenPlan {
  style: HalftoneStyle;
  width: number;
  height: number;
  outScale: number;
  outWidth: number;
  outHeight: number;
  cellPx: number;
  edgeWidth: number;
  shape: HalftoneShape;
  grit: number;
  invert: boolean;
  paper?: Rgb;
  grids: CellGrid[];
}

export interface RowRange {
  start: number;
  end: number;
}
