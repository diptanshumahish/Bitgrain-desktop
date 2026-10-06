import type { BezierAnchor, BezierHandle, VectorPath } from "../data/studioTypes";

const FLATTEN_STEPS = 24;

const lerp = (a: BezierHandle, b: BezierHandle, t: number): BezierHandle => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

const cubicAt = (
  p0: BezierHandle,
  p1: BezierHandle,
  p2: BezierHandle,
  p3: BezierHandle,
  t: number,
): BezierHandle => {
  const a = lerp(p0, p1, t);
  const b = lerp(p1, p2, t);
  const c = lerp(p2, p3, t);
  const d = lerp(a, b, t);
  const e = lerp(b, c, t);
  return lerp(d, e, t);
};

const sampleSegment = (
  a: BezierAnchor,
  b: BezierAnchor,
  steps: number,
): Array<[number, number]> => {
  const p0: BezierHandle = { x: a.x, y: a.y };
  const p1: BezierHandle = a.outHandle ?? p0;
  const p3: BezierHandle = { x: b.x, y: b.y };
  const p2: BezierHandle = b.inHandle ?? p3;
  const out: Array<[number, number]> = [];
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const point = cubicAt(p0, p1, p2, p3, t);
    out.push([point.x, point.y]);
  }
  return out;
};

export const flattenPath = (
  path: VectorPath,
  steps = FLATTEN_STEPS,
): Array<[number, number]> => {
  const { anchors, closed } = path;
  if (anchors.length === 0) return [];
  if (anchors.length === 1) return [[anchors[0].x, anchors[0].y]];
  const points: Array<[number, number]> = [];
  for (let i = 0; i < anchors.length - 1; i++) {
    points.push(...sampleSegment(anchors[i], anchors[i + 1], steps));
  }
  if (closed) {
    points.push(...sampleSegment(anchors[anchors.length - 1], anchors[0], steps));
  } else {
    const last = anchors[anchors.length - 1];
    points.push([last.x, last.y]);
  }
  return points;
};

export const polygonToAnchors = (
  ring: Array<[number, number]>,
): BezierAnchor[] =>
  ring.map(([x, y]) => ({ x, y, cornerType: "corner" as const }));
