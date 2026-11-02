import { applyToPoint, type Matrix, type Point } from "./matrix";

export interface CubicSegment {
  c1: Point | null;
  c2: Point | null;
  end: Point;
}

export interface Subpath {
  start: Point;
  segments: CubicSegment[];
  closed: boolean;
}

const mapPoint = (matrix: Matrix, point: Point | null): Point | null => (point ? applyToPoint(matrix, point) : null);

export const transformSubpath = (subpath: Subpath, matrix: Matrix): Subpath => ({
  start: applyToPoint(matrix, subpath.start),
  closed: subpath.closed,
  segments: subpath.segments.map((segment) => ({
    c1: mapPoint(matrix, segment.c1),
    c2: mapPoint(matrix, segment.c2),
    end: applyToPoint(matrix, segment.end),
  })),
});

const lineSegment = (end: Point): CubicSegment => ({ c1: null, c2: null, end });

export const polylineSubpath = (points: Point[], closed: boolean): Subpath | null => {
  if (points.length < 2) return null;
  return { start: points[0], segments: points.slice(1).map(lineSegment), closed };
};
