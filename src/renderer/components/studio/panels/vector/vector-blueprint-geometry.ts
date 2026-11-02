import type { BezierAnchor, BezierHandle } from "../../../../data/studioTypes";

const NORMALIZED_EXTENT = 100;

const scalePoint = (point: BezierHandle, width: number, height: number): BezierHandle => ({
  x: (point.x / NORMALIZED_EXTENT) * width,
  y: (point.y / NORMALIZED_EXTENT) * height,
});

export const scaleAnchors = (anchors: BezierAnchor[], width: number, height: number): BezierAnchor[] =>
  anchors.map((anchor) => ({
    ...anchor,
    ...scalePoint(anchor, width, height),
    inHandle: anchor.inHandle ? scalePoint(anchor.inHandle, width, height) : undefined,
    outHandle: anchor.outHandle ? scalePoint(anchor.outHandle, width, height) : undefined,
  }));

const isCurvedHandle = (anchor: BezierAnchor, handle: BezierHandle | undefined): boolean =>
  !!handle && (handle.x !== anchor.x || handle.y !== anchor.y);

export const countCurvedSegments = (anchors: BezierAnchor[], closed: boolean): number => {
  const segmentCount = closed ? anchors.length : Math.max(0, anchors.length - 1);
  let curved = 0;
  for (let index = 0; index < segmentCount; index++) {
    const start = anchors[index];
    const end = anchors[(index + 1) % anchors.length];
    if (isCurvedHandle(start, start.outHandle) || isCurvedHandle(end, end.inHandle)) curved += 1;
  }
  return curved;
};

export const curvedHandles = (anchor: BezierAnchor): BezierHandle[] =>
  [anchor.inHandle, anchor.outHandle].filter((handle): handle is BezierHandle => isCurvedHandle(anchor, handle));
