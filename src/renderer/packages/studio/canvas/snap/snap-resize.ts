import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import {
  canvasXLines,
  canvasYLines,
  collectMatches,
  EMPTY_AID_LINES,
  findCorrection,
  xLines,
  yLines,
  type AidLines,
  type SnapGuide,
  type SnapRect,
  type SnapResult,
  type TargetLine,
} from "./snap-engine";

interface PageSize {
  width: number;
  height: number;
}

const movingXEdges = (rect: SnapRect, dir: HandleDir): number[] => {
  if (dir.includes("e")) return [rect.x + rect.width];
  if (dir.includes("w")) return [rect.x];
  return [];
};

const movingYEdges = (rect: SnapRect, dir: HandleDir): number[] => {
  if (dir.includes("s")) return [rect.y + rect.height];
  if (dir.includes("n")) return [rect.y];
  return [];
};

const applyEdgeCorrection = (rect: SnapRect, dir: HandleDir, correctionX: number, correctionY: number): SnapRect => ({
  x: dir.includes("w") ? rect.x + correctionX : rect.x,
  y: dir.includes("n") ? rect.y + correctionY : rect.y,
  width: rect.width + (dir.includes("e") ? correctionX : dir.includes("w") ? -correctionX : 0),
  height: rect.height + (dir.includes("s") ? correctionY : dir.includes("n") ? -correctionY : 0),
});

const toGuides = (lines: TargetLine[], orientation: SnapGuide["orientation"], extent: [number, number]): SnapGuide[] =>
  lines.map((line) => ({
    orientation,
    position: line.position,
    start: Math.min(line.perpStart, extent[0]),
    end: Math.max(line.perpEnd, extent[1]),
  }));

export const computeResizeSnap = (
  resizing: SnapRect,
  dir: HandleDir,
  targets: SnapRect[],
  page: PageSize,
  threshold: number,
  aids: AidLines = EMPTY_AID_LINES,
): SnapResult => {
  const targetXLines = [...canvasXLines(page), ...aids.x, ...targets.flatMap(xLines)];
  const targetYLines = [...canvasYLines(page), ...aids.y, ...targets.flatMap(yLines)];
  const edgesX = movingXEdges(resizing, dir);
  const edgesY = movingYEdges(resizing, dir);
  const correctionX = edgesX.length ? findCorrection(edgesX, targetXLines, threshold) : 0;
  const correctionY = edgesY.length ? findCorrection(edgesY, targetYLines, threshold) : 0;
  const snapped = applyEdgeCorrection(resizing, dir, correctionX, correctionY);
  const guides = [
    ...toGuides(collectMatches(edgesX, targetXLines, correctionX), "vertical", [snapped.y, snapped.y + snapped.height]),
    ...toGuides(collectMatches(edgesY, targetYLines, correctionY), "horizontal", [snapped.x, snapped.x + snapped.width]),
  ];
  return { correctionX, correctionY, guides };
};

export const resizedRect = (start: SnapRect, dir: HandleDir, accumDx: number, accumDy: number): SnapRect =>
  applyEdgeCorrection(start, dir, accumDx, accumDy);
