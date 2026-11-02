import type { SnapRect } from "./snap-engine";

export type SnapAxis = "x" | "y";

interface SnapGap {
  axis: SnapAxis;
  start: number;
  end: number;
  cross: number;
  toPageEdge: boolean;
}

export interface SnapMeasurement extends SnapGap {
  equal: boolean;
}

interface AxisSpan {
  start: number;
  end: number;
}

interface PageSize {
  width: number;
  height: number;
}

const otherAxis = (axis: SnapAxis): SnapAxis => (axis === "x" ? "y" : "x");

const spanOf = (rect: SnapRect, axis: SnapAxis): AxisSpan =>
  axis === "x"
    ? { start: rect.x, end: rect.x + rect.width }
    : { start: rect.y, end: rect.y + rect.height };

const sharedSpan = (first: AxisSpan, second: AxisSpan): AxisSpan | null => {
  const start = Math.max(first.start, second.start);
  const end = Math.min(first.end, second.end);
  return end > start ? { start, end } : null;
};

const midpoint = (span: AxisSpan): number => (span.start + span.end) / 2;

const nearestGapBefore = (moving: SnapRect, targets: SnapRect[], axis: SnapAxis): SnapGap | null => {
  const movingSpan = spanOf(moving, axis);
  const movingCross = spanOf(moving, otherAxis(axis));
  let nearest: SnapGap | null = null;
  for (const target of targets) {
    const shared = sharedSpan(movingCross, spanOf(target, otherAxis(axis)));
    const targetEnd = spanOf(target, axis).end;
    if (!shared || targetEnd > movingSpan.start) continue;
    if (nearest && targetEnd <= nearest.start) continue;
    nearest = { axis, start: targetEnd, end: movingSpan.start, cross: midpoint(shared), toPageEdge: false };
  }
  return nearest;
};

const nearestGapAfter = (moving: SnapRect, targets: SnapRect[], axis: SnapAxis): SnapGap | null => {
  const movingSpan = spanOf(moving, axis);
  const movingCross = spanOf(moving, otherAxis(axis));
  let nearest: SnapGap | null = null;
  for (const target of targets) {
    const shared = sharedSpan(movingCross, spanOf(target, otherAxis(axis)));
    const targetStart = spanOf(target, axis).start;
    if (!shared || targetStart < movingSpan.end) continue;
    if (nearest && targetStart >= nearest.end) continue;
    nearest = { axis, start: movingSpan.end, end: targetStart, cross: midpoint(shared), toPageEdge: false };
  }
  return nearest;
};

const pageEdgeGapBefore = (moving: SnapRect, axis: SnapAxis): SnapGap | null => {
  const movingSpan = spanOf(moving, axis);
  if (movingSpan.start <= 0) return null;
  const cross = midpoint(spanOf(moving, otherAxis(axis)));
  return { axis, start: 0, end: movingSpan.start, cross, toPageEdge: true };
};

const pageEdgeGapAfter = (moving: SnapRect, page: PageSize, axis: SnapAxis): SnapGap | null => {
  const movingSpan = spanOf(moving, axis);
  const pageEnd = axis === "x" ? page.width : page.height;
  if (movingSpan.end >= pageEnd) return null;
  const cross = midpoint(spanOf(moving, otherAxis(axis)));
  return { axis, start: movingSpan.end, end: pageEnd, cross, toPageEdge: true };
};

export const gapLength = (gap: SnapGap): number => gap.end - gap.start;

export const findAxisGaps = (
  moving: SnapRect,
  targets: SnapRect[],
  page: PageSize,
  axis: SnapAxis,
): [SnapGap | null, SnapGap | null] => [
  nearestGapBefore(moving, targets, axis) ?? pageEdgeGapBefore(moving, axis),
  nearestGapAfter(moving, targets, axis) ?? pageEdgeGapAfter(moving, page, axis),
];

const toMeasurements = (gaps: [SnapGap | null, SnapGap | null]): SnapMeasurement[] => {
  const [before, after] = gaps;
  const equal =
    before !== null && after !== null && Math.round(gapLength(before)) === Math.round(gapLength(after));
  return [before, after]
    .filter((gap): gap is SnapGap => gap !== null && Math.round(gapLength(gap)) > 0)
    .map((gap) => ({ ...gap, equal }));
};

export const measureGaps = (moving: SnapRect, targets: SnapRect[], page: PageSize): SnapMeasurement[] => [
  ...toMeasurements(findAxisGaps(moving, targets, page, "x")),
  ...toMeasurements(findAxisGaps(moving, targets, page, "y")),
];
