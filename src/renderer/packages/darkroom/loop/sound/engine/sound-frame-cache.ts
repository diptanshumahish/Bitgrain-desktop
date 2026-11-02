import { imageSignal } from "../../../state/image-store";
import { createLoopFrameWorker, type LoopFrameWorker } from "../../engine/loop-frame-worker";
import { renderLoopFrame, type LoopRenderJob } from "../../engine/render-loop-frame";
import type { SoundDrive } from "../sound-settings";
import type { SoundRenderKey } from "@bitgrain/engine/loop/sound-frame-plan";
import { modulateSnapshot } from "./modulate-snapshot";

export interface SoundFrameCache {
  request: (keys: readonly SoundRenderKey[]) => Promise<void>;
  frameFor: (key: string) => ImageBitmap | null;
  renderedCount: (keys: readonly SoundRenderKey[]) => number;
  dispose: () => void;
}

interface SoundFrameCacheOptions {
  job: LoopRenderJob;
  drive: SoundDrive;
  onRendered?: () => void;
}

const stoppedError = (): DOMException => new DOMException("Loop render stopped", "AbortError");

export const createSoundFrameCache = (options: SoundFrameCacheOptions): SoundFrameCache => {
  const imageUrl = imageSignal.value;
  const frames = new Map<string, ImageBitmap>();
  const state = { queue: [] as SoundRenderKey[], disposed: false };
  const workerRef: { current: Promise<LoopFrameWorker> | null } = { current: null };
  const runningRef: { current: Promise<void> | null } = { current: null };

  const workerFor = (): Promise<LoopFrameWorker> => {
    if (!imageUrl) return Promise.reject(new Error("No image"));
    workerRef.current ??= createLoopFrameWorker(imageUrl, options.job.masks);
    return workerRef.current;
  };

  const renderKey = async (worker: LoopFrameWorker, key: SoundRenderKey): Promise<void> => {
    const snap = modulateSnapshot(options.job.snap, options.drive, key.level);
    const frame = await renderLoopFrame(worker, options.job, key.seedIndex, snap);
    if (state.disposed) {
      frame.close();
      throw stoppedError();
    }
    frames.set(key.key, frame);
    options.onRendered?.();
  };

  const drain = async (): Promise<void> => {
    try {
      const worker = await workerFor();
      while (state.queue.length > 0) {
        if (state.disposed) throw stoppedError();
        const [next, ...rest] = state.queue;
        state.queue = rest;
        if (!frames.has(next.key)) await renderKey(worker, next);
      }
    } finally {
      runningRef.current = null;
    }
  };

  const request = (keys: readonly SoundRenderKey[]): Promise<void> => {
    state.queue = keys.filter((key) => !frames.has(key.key));
    runningRef.current ??= drain();
    return runningRef.current;
  };

  const dispose = (): void => {
    state.disposed = true;
    state.queue = [];
    void workerRef.current?.then((worker) => worker.dispose(), () => undefined);
    for (const frame of frames.values()) frame.close();
    frames.clear();
  };

  return {
    request,
    frameFor: (key) => frames.get(key) ?? null,
    renderedCount: (keys) => keys.filter((key) => frames.has(key.key)).length,
    dispose,
  };
};
