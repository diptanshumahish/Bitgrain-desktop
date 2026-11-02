import type { WorkerResult } from "@bitgrain/engine/preview/types";
import { getSharedPreviewWorker, registerSharedWorkerCallback } from "../preview-cache";
import type { CompactSource } from "./compact-source";

const MIN_COMPACT_PIXEL_BUDGET = 40_000;
const FALLBACK_COMPACT_EDGE = 320;

let nextCompactJob = 0;

export const compactPixelBudget = (canvas: HTMLCanvasElement | null): number => {
  const displayEdge = canvas && canvas.clientWidth > 0 ? canvas.clientWidth : FALLBACK_COMPACT_EDGE;
  const pixelEdge = displayEdge * (window.devicePixelRatio || 1);
  return Math.max(MIN_COMPACT_PIXEL_BUDGET, pixelEdge * pixelEdge);
};

export const renderCompactInWorker = async (
  source: CompactSource,
  params: Record<string, unknown>,
  pixelBudget: number,
): Promise<WorkerResult> => {
  const worker = getSharedPreviewWorker();
  const bitmap = await createImageBitmap(source.bitmap);
  nextCompactJob += 1;
  const id = `compact-${nextCompactJob}`;
  return new Promise<WorkerResult>((resolve) => {
    registerSharedWorkerCallback(id, resolve);
    worker.postMessage(
      {
        type: "process-single",
        id,
        params: {
          ...params,
          halftoneSupersample: false,
          draftPixelBudget: pixelBudget,
          sourceWidth: source.width,
          sourceHeight: source.height,
        },
        bitmap,
      },
      [bitmap],
    );
  });
};
