import { imageMetaSignal } from "../../state/image-store";
import { capLongEdgeForPlan } from "@bitgrain/platform/plans/gate/plan-long-edge";
import { clampVideoDimensions } from "@bitgrain/platform/plans/export-plan-gate";
import { GIF_MAX_EDGE } from "@bitgrain/studio-core/animate/export-gif";
import type { LoopFormat } from "../loop-settings";
import type { FrameSize } from "./render-loop-frame";

export const LOOP_PREVIEW_LONG_EDGE = 720;
const LOOP_VIDEO_MAX_LONG_EDGE = 1920;
const PREVIEW_CANVAS_ID = "transformation-output-canvas";
const MIN_EDGE = 2;

const toEven = (value: number): number => Math.max(MIN_EDGE, Math.round(value / 2) * 2);

const fitLongEdge = (width: number, height: number, maxLongEdge: number): FrameSize => {
  const fit = Math.min(1, maxLongEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * fit)), height: Math.max(1, Math.round(height * fit)) };
};

export const exportLongEdgeFor = (plan: string, format: LoopFormat): number =>
  format === "gif" ? GIF_MAX_EDGE : capLongEdgeForPlan(plan, LOOP_VIDEO_MAX_LONG_EDGE);

export const previewFitSize = (width: number, height: number): FrameSize =>
  fitLongEdge(width, height, LOOP_PREVIEW_LONG_EDGE);

export type FitSize = (width: number, height: number) => FrameSize;

export const exportFitSize = (plan: string, format: LoopFormat): FitSize => (width, height) => {
  const fitted = fitLongEdge(width, height, exportLongEdgeFor(plan, format));
  if (format === "gif") return fitted;
  const clamped = clampVideoDimensions(plan, fitted.width, fitted.height);
  return { width: toEven(clamped.width), height: toEven(clamped.height) };
};

export const loopRenderScale = (targetLongEdge: number): number => {
  const preview = document.getElementById(PREVIEW_CANVAS_ID) as HTMLCanvasElement | null;
  if (!preview || preview.width === 0) return 1;
  const meta = imageMetaSignal.value;
  const nativeScale = meta ? meta.width / preview.width : 1;
  return Math.min(nativeScale, targetLongEdge / Math.max(preview.width, preview.height));
};
