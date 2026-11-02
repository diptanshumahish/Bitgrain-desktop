import type { AnchorCornerType, BezierAnchor, BezierHandle } from "@bitgrain/studio-core/model/studio-types";
import type { Point } from "../geometry/matrix";
import type { Subpath } from "../geometry/subpath-types";

export interface NormalBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const VIEW_SIZE = 100;
const CLOSE_EPSILON = 1e-3;
const COLLINEAR_TOLERANCE = 1e-2;
const LENGTH_TOLERANCE = 1e-2;

const normalize = (point: Point, box: NormalBox): BezierHandle => ({
  x: ((point.x - box.x) / box.width) * VIEW_SIZE,
  y: ((point.y - box.y) / box.height) * VIEW_SIZE,
});

const samePoint = (left: Point, right: Point): boolean =>
  Math.abs(left.x - right.x) < CLOSE_EPSILON && Math.abs(left.y - right.y) < CLOSE_EPSILON;

const cornerTypeOf = (anchor: BezierAnchor): AnchorCornerType => {
  if (!anchor.inHandle || !anchor.outHandle) return "corner";
  const inX = anchor.x - anchor.inHandle.x;
  const inY = anchor.y - anchor.inHandle.y;
  const outX = anchor.outHandle.x - anchor.x;
  const outY = anchor.outHandle.y - anchor.y;
  const inLength = Math.hypot(inX, inY);
  const outLength = Math.hypot(outX, outY);
  if (inLength === 0 || outLength === 0) return "corner";
  const cross = Math.abs(inX * outY - inY * outX) / (inLength * outLength);
  const dot = inX * outX + inY * outY;
  if (cross > COLLINEAR_TOLERANCE || dot <= 0) return "corner";
  return Math.abs(inLength - outLength) / Math.max(inLength, outLength) < LENGTH_TOLERANCE ? "smooth" : "asymmetric";
};

const rawAnchors = (subpath: Subpath): Array<{ point: Point; inHandle?: Point; outHandle?: Point }> => {
  const anchors: Array<{ point: Point; inHandle?: Point; outHandle?: Point }> = [{ point: subpath.start }];
  subpath.segments.forEach((segment) => {
    const previous = anchors[anchors.length - 1];
    if (segment.c1) anchors[anchors.length - 1] = { ...previous, outHandle: segment.c1 };
    anchors.push({ point: segment.end, inHandle: segment.c2 ?? undefined });
  });
  return anchors;
};

const mergeClosure = (anchors: ReturnType<typeof rawAnchors>, closed: boolean): ReturnType<typeof rawAnchors> => {
  const last = anchors[anchors.length - 1];
  if (!closed || anchors.length < 2 || !samePoint(last.point, anchors[0].point)) return anchors;
  const merged = anchors.slice(0, -1);
  merged[0] = { ...merged[0], inHandle: last.inHandle };
  return merged;
};

export const subpathToAnchors = (subpath: Subpath, closed: boolean, box: NormalBox): BezierAnchor[] =>
  mergeClosure(rawAnchors(subpath), closed).map((raw) => {
    const anchor: BezierAnchor = {
      ...normalize(raw.point, box),
      ...(raw.inHandle ? { inHandle: normalize(raw.inHandle, box) } : {}),
      ...(raw.outHandle ? { outHandle: normalize(raw.outHandle, box) } : {}),
    };
    return { ...anchor, cornerType: cornerTypeOf(anchor) };
  });

export const reverseAnchors = (anchors: BezierAnchor[]): BezierAnchor[] =>
  [...anchors].reverse().map((anchor) => ({
    x: anchor.x,
    y: anchor.y,
    cornerType: anchor.cornerType,
    ...(anchor.outHandle ? { inHandle: anchor.outHandle } : {}),
    ...(anchor.inHandle ? { outHandle: anchor.inHandle } : {}),
  }));
