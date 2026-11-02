import type { HalftoneShape, HalftoneStyle } from "./halftone-defaults";
import type { Rgb } from "./sample-bilinear";

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
  out: Uint8ClampedArray;
}
