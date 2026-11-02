import { computeSnap, EMPTY_AID_LINES, type AidLines, type SnapGuide, type SnapRect } from "./snap-engine";
import { equalSpacingCorrection, offsetRect } from "./snap-equal-spacing";
import { measureGaps, type SnapMeasurement } from "./snap-measure";

interface PageSize {
  width: number;
  height: number;
}

export interface SnapOverlay {
  guides: SnapGuide[];
  measurements: SnapMeasurement[];
}

interface ResolvedSnap extends SnapOverlay {
  correctionX: number;
  correctionY: number;
}

export const resolveSnap = (
  moving: SnapRect,
  targets: SnapRect[],
  page: PageSize,
  threshold: number,
  aids: AidLines = EMPTY_AID_LINES,
): ResolvedSnap => {
  const edgeSnap = computeSnap(moving, targets, page, threshold, aids);
  const aligned = offsetRect(moving, edgeSnap.correctionX, edgeSnap.correctionY);
  const spacingX = edgeSnap.correctionX === 0 ? equalSpacingCorrection(aligned, targets, page, "x", threshold) : 0;
  const spacingY = edgeSnap.correctionY === 0 ? equalSpacingCorrection(aligned, targets, page, "y", threshold) : 0;
  const snapped = offsetRect(aligned, spacingX, spacingY);
  return {
    correctionX: edgeSnap.correctionX + spacingX,
    correctionY: edgeSnap.correctionY + spacingY,
    guides: edgeSnap.guides,
    measurements: measureGaps(snapped, targets, page),
  };
};
