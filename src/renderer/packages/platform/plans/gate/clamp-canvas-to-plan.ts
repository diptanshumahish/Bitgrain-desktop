import { capLongEdgeForPlan } from "./plan-long-edge";

export function clampCanvasToPlan(source: HTMLCanvasElement, plan: string): HTMLCanvasElement {
  const longEdge = Math.max(source.width, source.height);
  const cappedLongEdge = capLongEdgeForPlan(plan, longEdge);
  if (cappedLongEdge >= longEdge) return source;
  const ratio = cappedLongEdge / longEdge;
  const clamped = document.createElement("canvas");
  clamped.width = Math.max(1, Math.round(source.width * ratio));
  clamped.height = Math.max(1, Math.round(source.height * ratio));
  const context = clamped.getContext("2d");
  if (!context) return source;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, clamped.width, clamped.height);
  return clamped;
}
