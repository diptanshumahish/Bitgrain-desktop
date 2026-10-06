import { lineAngleRadians } from "./hough-lines";
import { isConvexQuad } from "../homography";
import type { HoughLine } from "./hough-lines";
import type { GradientField } from "./sobel";
import type { MockupPoint, MockupQuad } from "../mockup-types";

const PARALLEL_TOLERANCE = Math.PI / 9;
const MIN_CROSS_ANGLE = Math.PI / 6;
const MIN_AREA_FRACTION = 0.02;
const MAX_AREA_FRACTION = 0.96;
const EDGE_SAMPLES = 24;
const SUPPORT_SEARCH_RADIUS = 2;
const AREA_WEIGHT = 0.25;
const DETERMINANT_EPSILON = 1e-6;

export interface ScoredQuad {
  corners: MockupQuad;
  score: number;
}

const angleGap = (first: number, second: number): number => {
  const gap = Math.abs(first - second) % Math.PI;
  return Math.min(gap, Math.PI - gap);
};

const intersect = (first: HoughLine, second: HoughLine): MockupPoint | null => {
  const firstAngle = lineAngleRadians(first);
  const secondAngle = lineAngleRadians(second);
  const cosFirst = Math.cos(firstAngle);
  const sinFirst = Math.sin(firstAngle);
  const cosSecond = Math.cos(secondAngle);
  const sinSecond = Math.sin(secondAngle);

  const determinant = cosFirst * sinSecond - cosSecond * sinFirst;
  if (Math.abs(determinant) < DETERMINANT_EPSILON) return null;
  return {
    x: (first.rho * sinSecond - second.rho * sinFirst) / determinant,
    y: (cosFirst * second.rho - cosSecond * first.rho) / determinant,
  };
};

const orderClockwise = (points: MockupPoint[]): MockupQuad => {
  const centerX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const centerY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const sorted = [...points].sort(
    (first, second) =>
      Math.atan2(first.y - centerY, first.x - centerX) - Math.atan2(second.y - centerY, second.x - centerX),
  );
  let startIndex = 0;
  sorted.forEach((point, index) => {
    if (point.x + point.y < sorted[startIndex].x + sorted[startIndex].y) startIndex = index;
  });
  return [
    sorted[startIndex % 4],
    sorted[(startIndex + 1) % 4],
    sorted[(startIndex + 2) % 4],
    sorted[(startIndex + 3) % 4],
  ];
};

const polygonArea = (corners: MockupQuad): number => {
  let total = 0;
  for (let index = 0; index < 4; index += 1) {
    const current = corners[index];
    const next = corners[(index + 1) % 4];
    total += current.x * next.y - next.x * current.y;
  }
  return Math.abs(total) / 2;
};

const localMaxMagnitude = (field: GradientField, x: number, y: number): number => {
  let best = 0;
  for (let offsetY = -SUPPORT_SEARCH_RADIUS; offsetY <= SUPPORT_SEARCH_RADIUS; offsetY += 1) {
    for (let offsetX = -SUPPORT_SEARCH_RADIUS; offsetX <= SUPPORT_SEARCH_RADIUS; offsetX += 1) {
      const sampleX = Math.round(x) + offsetX;
      const sampleY = Math.round(y) + offsetY;
      if (sampleX < 0 || sampleY < 0 || sampleX >= field.width || sampleY >= field.height) continue;
      const value = field.magnitude[sampleY * field.width + sampleX];
      if (value > best) best = value;
    }
  }
  return best;
};

const edgeSupport = (corners: MockupQuad, field: GradientField, threshold: number): number => {
  let supported = 0;
  let total = 0;
  for (let index = 0; index < 4; index += 1) {
    const from = corners[index];
    const to = corners[(index + 1) % 4];
    for (let step = 0; step <= EDGE_SAMPLES; step += 1) {
      const ratio = step / EDGE_SAMPLES;
      const x = from.x + (to.x - from.x) * ratio;
      const y = from.y + (to.y - from.y) * ratio;
      total += 1;
      if (localMaxMagnitude(field, x, y) >= threshold) supported += 1;
    }
  }
  return total === 0 ? 0 : supported / total;
};

const withinBounds = (corners: MockupQuad, width: number, height: number): boolean =>
  corners.every((corner) => corner.x >= 0 && corner.y >= 0 && corner.x <= width && corner.y <= height);

const parallelPairs = (lines: HoughLine[]): [HoughLine, HoughLine][] => {
  const pairs: [HoughLine, HoughLine][] = [];
  for (let first = 0; first < lines.length; first += 1) {
    for (let second = first + 1; second < lines.length; second += 1) {
      const gap = angleGap(lineAngleRadians(lines[first]), lineAngleRadians(lines[second]));
      if (gap <= PARALLEL_TOLERANCE) pairs.push([lines[first], lines[second]]);
    }
  }
  return pairs;
};

const buildQuad = (
  sideA: [HoughLine, HoughLine],
  sideB: [HoughLine, HoughLine],
): MockupQuad | null => {
  const points = [
    intersect(sideA[0], sideB[0]),
    intersect(sideA[1], sideB[0]),
    intersect(sideA[1], sideB[1]),
    intersect(sideA[0], sideB[1]),
  ];
  if (points.some((point) => point === null)) return null;
  return orderClockwise(points as MockupPoint[]);
};

export const bestQuadFromLines = (
  lines: HoughLine[],
  field: GradientField,
  threshold: number,
): ScoredQuad | null => {
  const pairs = parallelPairs(lines);
  const imageArea = field.width * field.height;
  let best: ScoredQuad | null = null;

  for (const sideA of pairs) {
    for (const sideB of pairs) {
      const crossAngle = angleGap(lineAngleRadians(sideA[0]), lineAngleRadians(sideB[0]));
      if (crossAngle < MIN_CROSS_ANGLE) continue;

      const corners = buildQuad(sideA, sideB);
      if (!corners || !isConvexQuad(corners) || !withinBounds(corners, field.width, field.height)) continue;

      const areaFraction = polygonArea(corners) / imageArea;
      if (areaFraction < MIN_AREA_FRACTION || areaFraction > MAX_AREA_FRACTION) continue;

      const score = edgeSupport(corners, field, threshold) * (1 - AREA_WEIGHT + AREA_WEIGHT * areaFraction);
      if (!best || score > best.score) best = { corners, score };
    }
  }
  return best;
};
