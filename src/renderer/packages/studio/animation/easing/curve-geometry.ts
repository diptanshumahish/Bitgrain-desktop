import type { BezierCurve } from "@bitgrain/studio-core/model/animation-types";

const CURVE_SIZE = 160;
const CURVE_PAD = 12;
const CURVE_Y_MIN = -0.6;
const CURVE_Y_MAX = 1.6;
export const CURVE_VIEW_HEIGHT = CURVE_SIZE * (CURVE_Y_MAX - CURVE_Y_MIN);
export const CURVE_VIEW_WIDTH = CURVE_SIZE + CURVE_PAD * 2;
const HANDLE_X_MIN = 0;
const HANDLE_X_MAX = 1;
const ROUND_FACTOR = 100;

interface CurvePoint {
  x: number;
  y: number;
}

export const toView = (x: number, y: number): CurvePoint => ({
  x: CURVE_PAD + x * CURVE_SIZE,
  y: (CURVE_Y_MAX - y) * CURVE_SIZE,
});

export const fromView = (x: number, y: number): CurvePoint => ({
  x: Math.min(HANDLE_X_MAX, Math.max(HANDLE_X_MIN, (x - CURVE_PAD) / CURVE_SIZE)),
  y: Math.min(CURVE_Y_MAX, Math.max(CURVE_Y_MIN, CURVE_Y_MAX - y / CURVE_SIZE)),
});

export const roundCurveValue = (value: number): number => Math.round(value * ROUND_FACTOR) / ROUND_FACTOR;

export const curvePath = (curve: BezierCurve): string => {
  const start = toView(0, 0);
  const first = toView(curve[0], curve[1]);
  const second = toView(curve[2], curve[3]);
  const end = toView(1, 1);
  return `M ${start.x} ${start.y} C ${first.x} ${first.y} ${second.x} ${second.y} ${end.x} ${end.y}`;
};

export const holdPath = (): string => {
  const start = toView(0, 0);
  const corner = toView(1, 0);
  const end = toView(1, 1);
  return `M ${start.x} ${start.y} L ${corner.x} ${corner.y} L ${end.x} ${end.y}`;
};

export const glyphPath = (curve: BezierCurve | null, size: number): string => {
  if (!curve) return `M 0 ${size} L ${size} ${size} L ${size} 0`;
  const point = (x: number, y: number): string => `${x * size} ${size - y * size}`;
  return `M ${point(0, 0)} C ${point(curve[0], curve[1])} ${point(curve[2], curve[3])} ${point(1, 1)}`;
};
