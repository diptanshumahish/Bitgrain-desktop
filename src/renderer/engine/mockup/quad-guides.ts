import type { MockupPoint, MockupQuad } from "./mockup-types";

const PARALLEL_EPSILON = 1e-6;
const MAX_GUIDE_DISTANCE = 60;

export interface VanishingPoints {
  horizontal: MockupPoint | null;
  vertical: MockupPoint | null;
}

export const lineIntersection = (
  firstStart: MockupPoint,
  firstEnd: MockupPoint,
  secondStart: MockupPoint,
  secondEnd: MockupPoint,
): MockupPoint | null => {
  const firstX = firstEnd.x - firstStart.x;
  const firstY = firstEnd.y - firstStart.y;
  const secondX = secondEnd.x - secondStart.x;
  const secondY = secondEnd.y - secondStart.y;

  const determinant = firstX * secondY - firstY * secondX;
  if (Math.abs(determinant) < PARALLEL_EPSILON) return null;

  const offsetX = secondStart.x - firstStart.x;
  const offsetY = secondStart.y - firstStart.y;
  const travel = (offsetX * secondY - offsetY * secondX) / determinant;
  const point = { x: firstStart.x + firstX * travel, y: firstStart.y + firstY * travel };
  if (Math.abs(point.x) > MAX_GUIDE_DISTANCE || Math.abs(point.y) > MAX_GUIDE_DISTANCE) return null;
  return point;
};

export const vanishingPoints = (corners: MockupQuad): VanishingPoints => {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;
  return {
    horizontal: lineIntersection(topLeft, topRight, bottomLeft, bottomRight),
    vertical: lineIntersection(topLeft, bottomLeft, topRight, bottomRight),
  };
};

const projectOntoAxis = (origin: MockupPoint, direction: MockupPoint, target: MockupPoint): MockupPoint => {
  const length = Math.hypot(direction.x, direction.y);
  if (length < PARALLEL_EPSILON) return target;
  const unitX = direction.x / length;
  const unitY = direction.y / length;
  const travel = (target.x - origin.x) * unitX + (target.y - origin.y) * unitY;
  return { x: origin.x + unitX * travel, y: origin.y + unitY * travel };
};

export const constrainToEdgeAxis = (
  startCorners: MockupQuad,
  index: number,
  desired: MockupPoint,
): MockupPoint => {
  const anchor = startCorners[index];
  const neighbours = [startCorners[(index + 3) % 4], startCorners[(index + 1) % 4]];

  const projections = neighbours.map((neighbour) =>
    projectOntoAxis(neighbour, { x: anchor.x - neighbour.x, y: anchor.y - neighbour.y }, desired),
  );
  const distances = projections.map((point) => Math.hypot(point.x - desired.x, point.y - desired.y));
  return distances[0] <= distances[1] ? projections[0] : projections[1];
};
