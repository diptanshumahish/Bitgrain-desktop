import type { Point } from "./matrix";
import type { CubicSegment } from "./subpath-types";

interface ArcParams {
  rx: number;
  ry: number;
  xAxisRotation: number;
  largeArc: boolean;
  sweep: boolean;
  end: Point;
}

interface ArcCenter {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  startAngle: number;
  sweepAngle: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;
const MAX_SEGMENT_SWEEP = Math.PI / 2;
const KAPPA_FACTOR = 4 / 3;
const TWO_PI = Math.PI * 2;

const vectorAngle = (ux: number, uy: number, vx: number, vy: number): number => {
  const sign = ux * vy - uy * vx < 0 ? -1 : 1;
  const dot = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
  return sign * Math.acos(Math.max(-1, Math.min(1, dot)));
};

const centerParams = (from: Point, arc: ArcParams, cos: number, sin: number): ArcCenter => {
  const halfDx = (from.x - arc.end.x) / 2;
  const halfDy = (from.y - arc.end.y) / 2;
  const x1 = cos * halfDx + sin * halfDy;
  const y1 = -sin * halfDx + cos * halfDy;
  let rx = Math.abs(arc.rx);
  let ry = Math.abs(arc.ry);
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const sign = arc.largeArc === arc.sweep ? -1 : 1;
  const factor = sign * Math.sqrt(Math.max(0, numerator / denominator));
  const cxPrime = (factor * rx * y1) / ry;
  const cyPrime = (-factor * ry * x1) / rx;
  const startAngle = vectorAngle(1, 0, (x1 - cxPrime) / rx, (y1 - cyPrime) / ry);
  let sweepAngle = vectorAngle((x1 - cxPrime) / rx, (y1 - cyPrime) / ry, (-x1 - cxPrime) / rx, (-y1 - cyPrime) / ry);
  if (!arc.sweep && sweepAngle > 0) sweepAngle -= TWO_PI;
  if (arc.sweep && sweepAngle < 0) sweepAngle += TWO_PI;
  return {
    cx: cos * cxPrime - sin * cyPrime + (from.x + arc.end.x) / 2,
    cy: sin * cxPrime + cos * cyPrime + (from.y + arc.end.y) / 2,
    rx, ry, startAngle, sweepAngle,
  };
};

const ellipsePoint = (center: ArcCenter, angle: number, cos: number, sin: number): Point => {
  const x = center.rx * Math.cos(angle);
  const y = center.ry * Math.sin(angle);
  return { x: center.cx + cos * x - sin * y, y: center.cy + sin * x + cos * y };
};

const ellipseDerivative = (center: ArcCenter, angle: number, cos: number, sin: number): Point => {
  const x = -center.rx * Math.sin(angle);
  const y = center.ry * Math.cos(angle);
  return { x: cos * x - sin * y, y: sin * x + cos * y };
};

const arcSegment = (center: ArcCenter, from: number, to: number, cos: number, sin: number): CubicSegment => {
  const alpha = KAPPA_FACTOR * Math.tan((to - from) / 4);
  const start = ellipsePoint(center, from, cos, sin);
  const end = ellipsePoint(center, to, cos, sin);
  const startTangent = ellipseDerivative(center, from, cos, sin);
  const endTangent = ellipseDerivative(center, to, cos, sin);
  return {
    c1: { x: start.x + alpha * startTangent.x, y: start.y + alpha * startTangent.y },
    c2: { x: end.x - alpha * endTangent.x, y: end.y - alpha * endTangent.y },
    end,
  };
};

export const arcToCubics = (from: Point, arc: ArcParams): CubicSegment[] => {
  if (from.x === arc.end.x && from.y === arc.end.y) return [];
  if (arc.rx === 0 || arc.ry === 0) return [{ c1: null, c2: null, end: arc.end }];
  const radians = arc.xAxisRotation * DEGREES_TO_RADIANS;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const center = centerParams(from, arc, cos, sin);
  const count = Math.max(1, Math.ceil(Math.abs(center.sweepAngle) / MAX_SEGMENT_SWEEP - 1e-9));
  const step = center.sweepAngle / count;
  const segments = Array.from({ length: count }, (_, index) =>
    arcSegment(center, center.startAngle + step * index, center.startAngle + step * (index + 1), cos, sin),
  );
  segments[segments.length - 1] = { ...segments[segments.length - 1], end: arc.end };
  return segments;
};
