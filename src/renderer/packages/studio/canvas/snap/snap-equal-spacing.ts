import type { SnapRect } from "./snap-engine";
import { findAxisGaps, gapLength, type SnapAxis } from "./snap-measure";

interface PageSize {
  width: number;
  height: number;
}

export const equalSpacingCorrection = (
  moving: SnapRect,
  targets: SnapRect[],
  page: PageSize,
  axis: SnapAxis,
  threshold: number,
): number => {
  const [before, after] = findAxisGaps(moving, targets, page, axis);
  if (!before || !after || before.toPageEdge || after.toPageEdge) return 0;
  const correction = (gapLength(after) - gapLength(before)) / 2;
  return Math.abs(correction) <= threshold ? correction : 0;
};

export const offsetRect = (rect: SnapRect, dx: number, dy: number): SnapRect => ({
  ...rect,
  x: rect.x + dx,
  y: rect.y + dy,
});
