import type { BezierAnchor, BezierHandle, VectorPath } from "../data/studioTypes";

const scaleHandle = (handle: BezierHandle | undefined, scaleX: number, scaleY: number): BezierHandle | undefined =>
  handle ? { x: handle.x * scaleX, y: handle.y * scaleY } : undefined;

const scaleAnchor = (anchor: BezierAnchor, scaleX: number, scaleY: number): BezierAnchor => ({
  ...anchor,
  x: anchor.x * scaleX,
  y: anchor.y * scaleY,
  inHandle: scaleHandle(anchor.inHandle, scaleX, scaleY),
  outHandle: scaleHandle(anchor.outHandle, scaleX, scaleY),
});

export const scaleVectorPath = (path: VectorPath, scaleX: number, scaleY: number): VectorPath => ({
  ...path,
  anchors: path.anchors.map((anchor) => scaleAnchor(anchor, scaleX, scaleY)),
  extraRings: path.extraRings?.map((ring) => ring.map((anchor) => scaleAnchor(anchor, scaleX, scaleY))),
});
