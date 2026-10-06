import {
  MAX_TIMELINE_PIXELS_PER_SECOND,
  MIN_TIMELINE_PIXELS_PER_SECOND,
  SNAP_THRESHOLD_PX,
} from "../../constants";

export function timeToPx(seconds: number, pxPerSecond: number): number {
  return seconds * pxPerSecond;
}

export function pxToTime(px: number, pxPerSecond: number): number {
  if (pxPerSecond <= 0) return 0;
  return Math.max(0, px / pxPerSecond);
}

export function clampZoom(pxPerSecond: number): number {
  return Math.min(
    MAX_TIMELINE_PIXELS_PER_SECOND,
    Math.max(MIN_TIMELINE_PIXELS_PER_SECOND, pxPerSecond),
  );
}

export function nextZoomLevel(pxPerSecond: number, factor: number): number {
  return clampZoom(pxPerSecond * factor);
}

const TICK_CANDIDATES = [0.1, 0.25, 0.5, 1, 2, 5, 10, 30, 60, 120, 300];
const MIN_TICK_SPACING_PX = 60;

export function pickTickInterval(pxPerSecond: number): number {
  for (const c of TICK_CANDIDATES) {
    if (c * pxPerSecond >= MIN_TICK_SPACING_PX) return c;
  }
  return 600;
}

export function gridStep(pxPerSecond: number): number {
  return pickTickInterval(pxPerSecond) / 5;
}

export function snapToGrid(
  candidateSec: number,
  pxPerSecond: number,
): number {
  const step = gridStep(pxPerSecond);
  if (step <= 0) return candidateSec;
  return Math.round(candidateSec / step) * step;
}

export interface SnapResult {
  value: number;
  snappedToTarget: boolean;
}

export function snapTimeDetailed(
  candidateSec: number,
  snapTargetsSec: number[],
  pxPerSecond: number,
): SnapResult {
  const thresholdSec = SNAP_THRESHOLD_PX / pxPerSecond;
  let best = candidateSec;
  let bestDelta = thresholdSec;
  let snappedToTarget = false;
  for (const target of snapTargetsSec) {
    const delta = Math.abs(target - candidateSec);
    if (delta < bestDelta) {
      best = target;
      bestDelta = delta;
      snappedToTarget = true;
    }
  }
  const gridCandidate = snapToGrid(candidateSec, pxPerSecond);
  const gridDelta = Math.abs(gridCandidate - candidateSec);
  if (gridDelta < bestDelta) {
    best = gridCandidate;
    bestDelta = gridDelta;
    snappedToTarget = false;
  }
  return { value: best, snappedToTarget };
}

export function snapTime(
  candidateSec: number,
  snapTargetsSec: number[],
  pxPerSecond: number,
): number {
  return snapTimeDetailed(candidateSec, snapTargetsSec, pxPerSecond).value;
}
