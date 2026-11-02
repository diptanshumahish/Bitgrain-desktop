import type { LoopFps, LoopMotion } from "../loop-settings";
import { createLoopFrameSource } from "../engine/loop-frame-source";
import { LOOP_PREVIEW_LONG_EDGE, previewFitSize } from "../engine/loop-output-size";
import { isStackChanged, stampStack } from "../engine/loop-stack-key";

interface LoopPlayerOptions {
  canvas: HTMLCanvasElement;
  motion: LoopMotion;
  fps: LoopFps;
  onProgress: (rendered: number, total: number) => void;
  onStale: () => void;
}

const MS_PER_SECOND = 1000;

const drawFrame = (canvas: HTMLCanvasElement, frame: ImageBitmap): void => {
  if (canvas.width !== frame.width) canvas.width = frame.width;
  if (canvas.height !== frame.height) canvas.height = frame.height;
  canvas.getContext("2d")?.drawImage(frame, 0, 0);
};

const isAbort = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError";

export const startLoopPlayer = (options: LoopPlayerOptions): (() => void) => {
  const stamp = stampStack();
  const total = options.fps;
  const source = createLoopFrameSource({
    motion: options.motion,
    frameCount: total,
    targetLongEdge: LOOP_PREVIEW_LONG_EDGE,
    fitSize: previewFitSize,
    onFrame: (rendered) => options.onProgress(rendered, total),
  });
  source.whenComplete.catch((error: unknown) => {
    if (!isAbort(error)) options.onStale();
  });

  const startedAt = performance.now();
  let lastIndex = -1;
  let drawnFrame: ImageBitmap | null = null;
  let rafId = 0;

  const tick = (now: number): void => {
    const index = Math.floor(((now - startedAt) * options.fps) / MS_PER_SECOND) % total;
    if (index !== lastIndex) {
      lastIndex = index;
      if (isStackChanged(stamp)) {
        options.onStale();
        return;
      }
    }
    const frame = source.frameAt(index) ?? (drawnFrame ? null : source.frameAt(0));
    if (frame && frame !== drawnFrame) {
      drawFrame(options.canvas, frame);
      drawnFrame = frame;
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    source.dispose();
  };
};
