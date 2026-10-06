import type { ShapeType } from "./studioTypes";

export type PatternKind =
  | "checkerboard"
  | "grid"
  | "stripes"
  | "hex"
  | "mandala"
  | "kaleidoscope";

export interface CheckerboardParams {
  rows: number;
  cols: number;
  cellSize: number;
  colorA: string;
  colorB: string;
}

export interface GridParams {
  rows: number;
  cols: number;
  cellSize: number;
  gap: number;
  shape: ShapeType;
  color: string;
}

export interface StripesParams {
  count: number;
  thickness: number;
  gap: number;
  angle: number;
  colorA: string;
  colorB: string;
}

export interface HexParams {
  rows: number;
  cols: number;
  cellSize: number;
  color: string;
}

export interface MandalaParams {
  copies: number;
  radius: number;
  petalWidth: number;
  petalHeight: number;
  shape: ShapeType;
  color: string;
}

export interface KaleidoscopeParams {
  copies: number;
  radius: number;
  petalWidth: number;
  petalHeight: number;
  shape: ShapeType;
  color: string;
}

export type PatternParams =
  | { kind: "checkerboard"; params: CheckerboardParams }
  | { kind: "grid"; params: GridParams }
  | { kind: "stripes"; params: StripesParams }
  | { kind: "hex"; params: HexParams }
  | { kind: "mandala"; params: MandalaParams }
  | { kind: "kaleidoscope"; params: KaleidoscopeParams };
