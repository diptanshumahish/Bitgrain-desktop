import type { WorkerResult } from "@bitgrain/engine/preview/types";

const ASPECT_TOLERANCE = 0.005;
const MIN_KEPT_FRACTION = 0.5;

const keepsCurrentSize = (target: HTMLCanvasElement, width: number, height: number): boolean => {
  if (target.width < width * MIN_KEPT_FRACTION || target.height === 0) return false;
  const aspectDrift = Math.abs(target.width / target.height - width / height) / (width / height);
  return aspectDrift < ASPECT_TOLERANCE;
};

export const presentDraft = (target: HTMLCanvasElement, draft: HTMLCanvasElement, result: WorkerResult): void => {
  const width = result.targetWidth ?? draft.width;
  const height = result.targetHeight ?? draft.height;
  if (!keepsCurrentSize(target, width, height)) {
    target.width = width;
    target.height = height;
  }
  const context = target.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, target.width, target.height);
  context.imageSmoothingEnabled = !result.isDither;
  context.drawImage(draft, 0, 0, target.width, target.height);
};
