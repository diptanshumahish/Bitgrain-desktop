import type { Point } from "./matrix";
import type { Subpath } from "./subpath-types";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const EPSILON = 1e-12;

const EMPTY_BOUNDS: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

export const isEmptyBounds = (bounds: Bounds): boolean => bounds.minX > bounds.maxX || bounds.minY > bounds.maxY;

const includePoint = (bounds: Bounds, point: Point): Bounds => ({
  minX: Math.min(bounds.minX, point.x),
  minY: Math.min(bounds.minY, point.y),
  maxX: Math.max(bounds.maxX, point.x),
  maxY: Math.max(bounds.maxY, point.y),
});

const cubicValue = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
  const inverse = 1 - t;
  return inverse ** 3 * p0 + 3 * inverse ** 2 * t * p1 + 3 * inverse * t ** 2 * p2 + t ** 3 * p3;
};

const derivativeRoots = (p0: number, p1: number, p2: number, p3: number): number[] => {
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  if (Math.abs(a) < EPSILON) return Math.abs(b) < EPSILON ? [] : [-c / b];
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  const root = Math.sqrt(discriminant);
  return [(-b + root) / (2 * a), (-b - root) / (2 * a)];
};

const cubicBounds = (bounds: Bounds, p0: Point, p1: Point, p2: Point, p3: Point): Bounds => {
  const roots = [...derivativeRoots(p0.x, p1.x, p2.x, p3.x), ...derivativeRoots(p0.y, p1.y, p2.y, p3.y)]
    .filter((t) => t > 0 && t < 1);
  return [...roots, 1].reduce(
    (acc, t) => includePoint(acc, { x: cubicValue(p0.x, p1.x, p2.x, p3.x, t), y: cubicValue(p0.y, p1.y, p2.y, p3.y, t) }),
    includePoint(bounds, p0),
  );
};

const subpathBounds = (subpath: Subpath, initial: Bounds = EMPTY_BOUNDS): Bounds => {
  let bounds = includePoint(initial, subpath.start);
  let previous = subpath.start;
  for (const segment of subpath.segments) {
    bounds = cubicBounds(bounds, previous, segment.c1 ?? previous, segment.c2 ?? segment.end, segment.end);
    previous = segment.end;
  }
  return bounds;
};

export const subpathsBounds = (subpaths: Subpath[]): Bounds =>
  subpaths.reduce((acc, subpath) => subpathBounds(subpath, acc), EMPTY_BOUNDS);
