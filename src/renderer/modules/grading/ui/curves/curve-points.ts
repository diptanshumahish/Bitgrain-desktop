import type { CurvePoint } from "../../engine/grade-types";
import { createCurveSampler } from "../../engine/curve-sampler";

export const CURVE_VIEW_SIZE = 100;
export const MAX_CURVE_POINTS = 10;

const HIT_RADIUS = 0.06;
const MIN_GAP = 0.02;
const PATH_SAMPLES = 64;

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

export const findNearestPoint = (points: readonly CurvePoint[], target: CurvePoint): number | null => {
  let bestIndex: number | null = null;
  let bestDistance = HIT_RADIUS;
  points.forEach((point, index) => {
    const distance = Math.hypot(point.x - target.x, point.y - target.y);
    if (distance <= bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
};

export const insertPoint = (points: readonly CurvePoint[], target: CurvePoint): { points: CurvePoint[]; index: number } => {
  const index = points.findIndex((point) => point.x > target.x);
  const insertAt = index === -1 ? points.length : index;
  const next = [...points.slice(0, insertAt), target, ...points.slice(insertAt)];
  return { points: next, index: insertAt };
};

export const movePoint = (points: readonly CurvePoint[], index: number, target: CurvePoint): CurvePoint[] => {
  const isFirst = index === 0;
  const isLast = index === points.length - 1;
  const low = isFirst ? 0 : points[index - 1].x + MIN_GAP;
  const high = isLast ? 1 : points[index + 1].x - MIN_GAP;
  const x = isFirst ? 0 : isLast ? 1 : Math.min(high, Math.max(low, target.x));
  return points.map((point, position) => (position === index ? { x, y: clampUnit(target.y) } : point));
};

export const removePoint = (points: readonly CurvePoint[], index: number): CurvePoint[] => {
  if (index === 0 || index === points.length - 1) return [...points];
  return points.filter((_, position) => position !== index);
};

export const buildCurvePath = (points: readonly CurvePoint[]): string => {
  const sample = createCurveSampler(points);
  const segments: string[] = [];
  for (let step = 0; step <= PATH_SAMPLES; step += 1) {
    const x = step / PATH_SAMPLES;
    const command = step === 0 ? "M" : "L";
    segments.push(`${command}${(x * CURVE_VIEW_SIZE).toFixed(2)} ${((1 - sample(x)) * CURVE_VIEW_SIZE).toFixed(2)}`);
  }
  return segments.join(" ");
};
