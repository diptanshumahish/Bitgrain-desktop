import type { ColorGrade } from "../engine/grade-types";

export type RGB = [number, number, number];

export interface LuminanceRange {
  enabled: boolean;
  min: number;
  max: number;
  softness: number;
}

export interface ColorRange {
  enabled: boolean;
  color: RGB;
  tolerance: number;
  softness: number;
}

export interface LinearShape {
  kind: "linear";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RadialShape {
  kind: "radial";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export type MaskShape = LinearShape | RadialShape;

export interface MaskArea {
  brush: string | null;
  shape: MaskShape | null;
  luminance: LuminanceRange;
  color: ColorRange;
  invert: boolean;
  feather: number;
}

export type MaskEffectMode = "keep" | "remove";

export interface MaskLayer {
  id: string;
  name: string;
  visible: boolean;
  amount: number;
  effect: MaskEffectMode;
  area: MaskArea;
  grade: ColorGrade;
}

export type WorkerMaskLayer = Omit<MaskLayer, "area"> & {
  area: Omit<MaskArea, "brush"> & { hasBrush: boolean };
};
