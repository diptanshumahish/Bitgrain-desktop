import { imageSignal } from "../../state/image-store";
import type { LoopMotion } from "../loop-settings";
import { createLoopFrameWorker, type LoopFrameWorker } from "./loop-frame-worker";
import { renderLoopFrame } from "./render-loop-frame";
import { buildLoopJob } from "./build-loop-job";
import type { FitSize } from "./loop-output-size";

interface LoopFrameSourceOptions {
  motion: LoopMotion;
  frameCount: number;
  targetLongEdge: number;
  fitSize: FitSize;
  onFrame?: (renderedCount: number) => void;
}

interface LoopFrameSource {
  frameAt: (index: number) => ImageBitmap | null;
  whenComplete: Promise<ImageBitmap[]>;
  dispose: () => void;
}

const stoppedError = (): DOMException => new DOMException("Loop render stopped", "AbortError");

export const createLoopFrameSource = (options: LoopFrameSourceOptions): LoopFrameSource => {
  const imageUrl = imageSignal.value;
  const job = buildLoopJob(options.motion, options.targetLongEdge, options.fitSize);
  const frames: Array<ImageBitmap | null> = Array.from({ length: options.frameCount }, () => null);
  let worker: LoopFrameWorker | null = null;
  let disposed = false;

  const renderAll = async (): Promise<ImageBitmap[]> => {
    if (!imageUrl) throw new Error("No image");
    const activeWorker = await createLoopFrameWorker(imageUrl, job.masks);
    worker = activeWorker;
    if (disposed) activeWorker.dispose();
    for (let index = 0; index < frames.length; index++) {
      if (disposed) throw stoppedError();
      const frame = await renderLoopFrame(activeWorker, job, index);
      if (disposed) {
        frame.close();
        throw stoppedError();
      }
      frames[index] = frame;
      options.onFrame?.(index + 1);
    }
    activeWorker.dispose();
    return frames.filter((frame): frame is ImageBitmap => frame !== null);
  };

  const dispose = (): void => {
    disposed = true;
    worker?.dispose();
    for (const frame of frames) frame?.close();
  };

  return { frameAt: (index) => frames[index] ?? null, whenComplete: renderAll(), dispose };
};
