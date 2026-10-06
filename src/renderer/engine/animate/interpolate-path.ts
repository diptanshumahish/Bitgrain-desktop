import type { BezierAnchor, BezierHandle, VectorPath } from "../../data/studioTypes";

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

const lerpHandle = (
  from: BezierHandle | undefined,
  to: BezierHandle | undefined,
  t: number,
): BezierHandle | undefined => {
  if (from && to) return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
  return t < 0.5 ? from : to;
};

const lerpAnchor = (from: BezierAnchor, to: BezierAnchor, t: number): BezierAnchor => ({
  x: lerp(from.x, to.x, t),
  y: lerp(from.y, to.y, t),
  cornerType: t < 0.5 ? from.cornerType : to.cornerType,
  inHandle: lerpHandle(from.inHandle, to.inHandle, t),
  outHandle: lerpHandle(from.outHandle, to.outHandle, t),
});

export const interpolatePath = (from: VectorPath, to: VectorPath, t: number): VectorPath => {
  if (from.anchors.length !== to.anchors.length) return t < 0.5 ? from : to;
  return {
    closed: t < 0.5 ? from.closed : to.closed,
    anchors: from.anchors.map((anchor, index) => lerpAnchor(anchor, to.anchors[index], t)),
  };
};
