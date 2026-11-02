export type GradientKind = "linear" | "radial" | "angular" | "diamond";

export interface GradientPoint {
  x: number;
  y: number;
}

export interface PaintStop {
  color: string;
  opacity: number;
  pos: number;
}

export interface PaintGradient {
  kind: GradientKind;
  stops: PaintStop[];
  start: GradientPoint;
  end: GradientPoint;
  aspect: number;
}

export type StrokeAlign = "inside" | "center" | "outside";

export type LineEndCap = "none" | "arrow" | "triangle" | "circle" | "bar";

export type CornerRadii = [number, number, number, number];

export interface CornerOptions {
  cornerRadii?: CornerRadii;
  cornerSmoothing?: number;
}

export interface ShapeGeometryOptions extends CornerOptions {
  starPoints?: number;
  starInnerRatio?: number;
  polygonSides?: number;
  arcStart?: number;
  arcSweep?: number;
  arcInnerRatio?: number;
  startCap?: LineEndCap;
  endCap?: LineEndCap;
}

export interface StrokeStyleOptions {
  strokeAlign?: StrokeAlign;
  dashPattern?: [number, number];
}
