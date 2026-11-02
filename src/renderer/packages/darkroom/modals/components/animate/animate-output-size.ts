import { getPlanLimits, type VideoResolution } from "@bitgrain/platform/plans/plan-limits";
import { capLongEdgeForPlan } from "@bitgrain/platform/plans/gate/plan-long-edge";
import { clampVideoDimensions } from "@bitgrain/platform/plans/export-plan-gate";
import { encodeLongEdgeFor, type AnimateFraming } from "@bitgrain/studio-core/animate/framing/frame-canvas";

const LONG_EDGE_BY_RESOLUTION: Record<VideoResolution, number> = {
  "720p": 1280,
  "1080p": 1920,
  "4k": 3840,
};

const MIN_EDGE = 2;

interface AnimateOutputSize {
  width: number;
  height: number;
}

const toEven = (value: number): number => Math.max(MIN_EDGE, Math.round(value / 2) * 2);

export const animateTargetLongEdge = (plan: string, framing: AnimateFraming): number => {
  const planLongEdge = LONG_EDGE_BY_RESOLUTION[getPlanLimits(plan).videoMaxResolution];
  return capLongEdgeForPlan(plan, encodeLongEdgeFor(framing, planLongEdge));
};

export const animateOutputSize = (
  plan: string,
  base: HTMLCanvasElement,
  targetLongEdge: number,
): AnimateOutputSize => {
  const fit = Math.min(1, targetLongEdge / Math.max(base.width, base.height));
  const clamped = clampVideoDimensions(plan, base.width * fit, base.height * fit);
  return { width: toEven(clamped.width), height: toEven(clamped.height) };
};
