import type { CurvePoint } from "./grade-types";

export type CurveSampler = (x: number) => number;

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

const sortPoints = (points: readonly CurvePoint[]): CurvePoint[] =>
  [...points].sort((first, second) => first.x - second.x);

const computeSecants = (points: CurvePoint[]): number[] =>
  points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const run = next.x - point.x;
    return run > 0 ? (next.y - point.y) / run : 0;
  });

const computeTangents = (secants: number[]): number[] => {
  const tangents = [secants[0], ...secants.slice(1).map((slope, index) => (secants[index] + slope) / 2), secants[secants.length - 1]];
  return tangents.map((tangent, index) => {
    const before = secants[index - 1];
    const after = secants[index];
    if (before !== undefined && before * (after ?? before) <= 0) return 0;
    return tangent;
  });
};

const limitTangents = (secants: number[], tangents: number[]): number[] => {
  const limited = [...tangents];
  secants.forEach((secant, index) => {
    if (secant === 0) {
      limited[index] = 0;
      limited[index + 1] = 0;
      return;
    }
    const alpha = limited[index] / secant;
    const beta = limited[index + 1] / secant;
    const magnitude = alpha * alpha + beta * beta;
    if (magnitude <= 9) return;
    const factor = 3 / Math.sqrt(magnitude);
    limited[index] = factor * alpha * secant;
    limited[index + 1] = factor * beta * secant;
  });
  return limited;
};

const findSegment = (points: CurvePoint[], x: number): number => {
  for (let index = points.length - 2; index >= 0; index -= 1) {
    if (x >= points[index].x) return index;
  }
  return 0;
};

const hermite = (start: CurvePoint, end: CurvePoint, startTangent: number, endTangent: number, x: number): number => {
  const width = end.x - start.x;
  if (width <= 0) return start.y;
  const t = (x - start.x) / width;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * start.y
    + (t3 - 2 * t2 + t) * width * startTangent
    + (-2 * t3 + 3 * t2) * end.y
    + (t3 - t2) * width * endTangent;
};

export const createCurveSampler = (rawPoints: readonly CurvePoint[]): CurveSampler => {
  const points = sortPoints(rawPoints);
  if (points.length < 2) return clampUnit;
  const secants = computeSecants(points);
  const tangents = limitTangents(secants, computeTangents(secants));
  const first = points[0];
  const last = points[points.length - 1];
  return (x: number): number => {
    if (x <= first.x) return clampUnit(first.y);
    if (x >= last.x) return clampUnit(last.y);
    const index = findSegment(points, x);
    return clampUnit(hermite(points[index], points[index + 1], tangents[index], tangents[index + 1], x));
  };
};
