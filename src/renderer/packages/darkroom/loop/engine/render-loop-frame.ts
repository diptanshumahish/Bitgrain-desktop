import type { TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";
import type { MaskLayer } from "@bitgrain/engine/grading/mask/mask-types";
import type { PrintFinishOptions } from "@bitgrain/engine/finish/print-finish";
import { applyPrintFinishToCanvas } from "@bitgrain/engine/finish/print-finish";
import { snapshotToWorkerParams } from "@bitgrain/engine/preview/worker-params";
import { paintWorkerResult, type PaintColors } from "@bitgrain/engine/preview/paint-worker-result";
import { buildWorkerMaskParams } from "../../grading/editor/worker-mask-params";
import { applyMaskOutputs } from "../../grading/editor/apply-editor-mask";
import type { LoopMotion } from "../loop-settings";
import type { LoopFrameWorker } from "./loop-frame-worker";
import { grainSeedFor, seedParamsFor } from "@bitgrain/engine/loop/loop-seeds";
import { centerCropBox } from "@bitgrain/engine/loop/crop-box";

export interface FrameSize {
  width: number;
  height: number;
}

export interface LoopRenderJob {
  snap: TransformSnapshot;
  masks: readonly MaskLayer[];
  colors: PaintColors;
  motion: LoopMotion;
  renderScale: number;
  printFinish: PrintFinishOptions | null;
  fitSize: (width: number, height: number) => FrameSize;
  cropAspect: number | null;
}

const SMOOTH_DOWNSCALE_MODE = "halftone";

const fitCanvas = (source: HTMLCanvasElement, job: LoopRenderJob, snap: TransformSnapshot): HTMLCanvasElement => {
  const crop = centerCropBox(source.width, source.height, job.cropAspect);
  const size = job.fitSize(crop.width, crop.height);
  const out = document.createElement("canvas");
  out.width = size.width;
  out.height = size.height;
  const context = out.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.imageSmoothingEnabled = snap.modes[snap.modes.length - 1] === SMOOTH_DOWNSCALE_MODE;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, size.width, size.height);
  return out;
};

export const renderLoopFrame = async (
  worker: LoopFrameWorker,
  job: LoopRenderJob,
  frameIndex: number,
  snap: TransformSnapshot = job.snap,
): Promise<ImageBitmap> => {
  const { params } = snapshotToWorkerParams(snap, job.renderScale);
  const result = await worker.process({
    ...params,
    ...buildWorkerMaskParams(job.masks, null),
    ...seedParamsFor(job.motion, frameIndex),
  });
  const painted = paintWorkerResult(result, snap, job.colors);
  applyMaskOutputs(painted, result);
  const out = fitCanvas(painted, job, snap);
  if (job.printFinish) applyPrintFinishToCanvas(out, { ...job.printFinish, seed: grainSeedFor(job.motion, frameIndex) });
  return createImageBitmap(out);
};
