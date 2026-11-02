import type { BezierAnchor } from "@bitgrain/studio-core/model/studio-types";
import { flattenPath } from "@bitgrain/studio-core/geometry/path-flatten";
import { reverseAnchors } from "./subpath-anchors";

type Polygon = Array<[number, number]>;

const FLATTEN_STEPS = 8;

const signedArea = (polygon: Polygon): number =>
  polygon.reduce((total, [x1, y1], index) => {
    const [x2, y2] = polygon[(index + 1) % polygon.length];
    return total + (x1 * y2 - x2 * y1);
  }, 0) / 2;

const containsPoint = (polygon: Polygon, [px, py]: [number, number]): boolean => {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [xi, yi] = polygon[index];
    const [xj, yj] = polygon[previous];
    const crosses = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
};

const nestingDepth = (polygons: Polygon[], index: number): number => {
  const probe = polygons[index][0];
  if (!probe) return 0;
  return polygons.filter((polygon, other) => other !== index && polygon.length > 2 && containsPoint(polygon, probe)).length;
};

export const orientForEvenOdd = (rings: BezierAnchor[][]): BezierAnchor[][] => {
  const polygons = rings.map((anchors) => flattenPath({ anchors, closed: true }, FLATTEN_STEPS));
  return rings.map((anchors, index) => {
    const wantsPositive = nestingDepth(polygons, index) % 2 === 0;
    const isPositive = signedArea(polygons[index]) >= 0;
    return wantsPositive === isPositive ? anchors : reverseAnchors(anchors);
  });
};
