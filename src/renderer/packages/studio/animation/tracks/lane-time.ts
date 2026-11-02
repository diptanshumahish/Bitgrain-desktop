const SNAP_MS = 10;
const PERCENT = 100;

export const timeFromLane = (lane: HTMLElement, clientX: number, totalMs: number): number => {
  const rect = lane.getBoundingClientRect();
  const ratio = Math.min(Math.max((clientX - rect.left) / Math.max(1, rect.width), 0), 1);
  return Math.round((ratio * totalMs) / SNAP_MS) * SNAP_MS;
};

export const lanePercent = (timeMs: number, totalMs: number): string =>
  `${totalMs > 0 ? Math.min(Math.max(timeMs / totalMs, 0), 1) * PERCENT : 0}%`;

const MS_PER_SECOND = 1000;

export const formatSeconds = (timeMs: number): string => `${(timeMs / MS_PER_SECOND).toFixed(2)}s`;
