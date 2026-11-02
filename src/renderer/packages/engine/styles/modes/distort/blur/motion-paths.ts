import type { SelectOption } from "../../../engine/style-types";

export type PathPoint = readonly [number, number];

const S_CURVE_POINTS = 25;
const CURL_POINTS = 29;
const CURL_TURN = 1.8 * Math.PI;
const CURL_START = 0.15;
const DIAGONAL_REACH = 0.75;
const DEGREES_TO_RADIANS = Math.PI / 180;

const sCurve = (): PathPoint[] =>
  Array.from({ length: S_CURVE_POINTS }, (_, index) => {
    const across = -1 + (2 * index) / (S_CURVE_POINTS - 1);
    return [across, 0.5 * Math.sin(Math.PI * across)] as const;
  });

const curl = (): PathPoint[] =>
  Array.from({ length: CURL_POINTS }, (_, index) => {
    const progress = index / (CURL_POINTS - 1);
    const reach = CURL_START + (1 - CURL_START) * progress;
    return [reach * Math.cos(progress * CURL_TURN), reach * Math.sin(progress * CURL_TURN)] as const;
  });

export const anglePath = (degrees: number): PathPoint[] => {
  const angle = degrees * DEGREES_TO_RADIANS;
  return [[-Math.cos(angle), -Math.sin(angle)], [Math.cos(angle), Math.sin(angle)]];
};

export const MOTION_PATHS: Readonly<Record<string, () => PathPoint[]>> = {
  diagonal: () => [[-DIAGONAL_REACH, -DIAGONAL_REACH], [DIAGONAL_REACH, DIAGONAL_REACH]],
  wave: sCurve,
  curl,
};

export const PATH_OPTIONS: readonly SelectOption[] = [
  { value: "line", label: "Straight" },
  { value: "diagonal", label: "Diagonal" },
  { value: "wave", label: "S curve" },
  { value: "curl", label: "Curl" },
];

const segmentLengths = (points: readonly PathPoint[]): number[] =>
  points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));

const pointAlong = (points: readonly PathPoint[], lengths: readonly number[], distance: number): PathPoint => {
  let remaining = distance;
  for (let index = 0; index < lengths.length; index++) {
    if (remaining <= lengths[index] || index === lengths.length - 1) {
      const blend = lengths[index] > 0 ? Math.min(1, remaining / lengths[index]) : 0;
      const [fromX, fromY] = points[index];
      return [fromX + (points[index + 1][0] - fromX) * blend, fromY + (points[index + 1][1] - fromY) * blend];
    }
    remaining -= lengths[index];
  }
  return points[0];
};

export const resamplePath = (points: readonly PathPoint[], count: number): PathPoint[] => {
  const lengths = segmentLengths(points);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  return Array.from({ length: count }, (_, index) => pointAlong(points, lengths, (total * index) / (count - 1)));
};
