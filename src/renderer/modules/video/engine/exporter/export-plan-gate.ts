import { getPlanLimits, type VideoResolution } from "../../../../config/plan-limits";

const MAX_SHORT_EDGE_BY_RESOLUTION: Record<VideoResolution, number> = {
  "720p": 720,
  "1080p": 1080,
  "4k": 2160,
};

export interface GatedDimensions {
  width: number;
  height: number;
  clamped: boolean;
}

export function planRequiresVideoWatermark(plan: string): boolean {
  return getPlanLimits(plan).watermark;
}

export function maxVideoShortEdge(plan: string): number {
  return MAX_SHORT_EDGE_BY_RESOLUTION[getPlanLimits(plan).videoMaxResolution];
}

export function clampVideoDimensions(
  plan: string,
  width: number,
  height: number,
): GatedDimensions {
  const cap = maxVideoShortEdge(plan);
  const shortEdge = Math.min(width, height);
  if (shortEdge <= cap) return { width, height, clamped: false };
  const fit = cap / shortEdge;
  return {
    width: Math.max(2, Math.round(width * fit)),
    height: Math.max(2, Math.round(height * fit)),
    clamped: true,
  };
}
