import type { VectorPath } from "../../model/studio-types";
import { flattenPath } from "../../geometry/path-flatten";

const SAMPLE_STEPS = 64;

export interface PathSampler {
  points: Array<[number, number]>;
  distances: number[];
  total: number;
}

interface PathPoint {
  x: number;
  y: number;
  angle: number;
}

const closedPoints = (path: VectorPath): Array<[number, number]> => {
  const points = flattenPath(path, SAMPLE_STEPS);
  if (!path.closed || points.length === 0) return points;
  return [...points, points[0]];
};

export const createPathSampler = (path: VectorPath): PathSampler => {
  const points = closedPoints(path);
  const distances = points.reduce<number[]>((acc, point, index) => {
    if (index === 0) return [0];
    const previous = points[index - 1];
    return [...acc, acc[index - 1] + Math.hypot(point[0] - previous[0], point[1] - previous[1])];
  }, []);
  return { points, distances, total: distances[distances.length - 1] ?? 0 };
};

const segmentIndexAt = (sampler: PathSampler, distance: number): number => {
  const index = sampler.distances.findIndex((value) => value >= distance);
  return Math.max(1, index === -1 ? sampler.distances.length - 1 : index);
};

export const pointAtDistance = (sampler: PathSampler, distance: number): PathPoint => {
  const index = segmentIndexAt(sampler, distance);
  const [startX, startY] = sampler.points[index - 1];
  const [endX, endY] = sampler.points[index];
  const span = sampler.distances[index] - sampler.distances[index - 1];
  const ratio = span > 0 ? (distance - sampler.distances[index - 1]) / span : 0;
  return {
    x: startX + (endX - startX) * ratio,
    y: startY + (endY - startY) * ratio,
    angle: Math.atan2(endY - startY, endX - startX),
  };
};
