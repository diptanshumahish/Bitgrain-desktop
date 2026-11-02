import type { WorkerResult } from "@bitgrain/engine/preview/types";
import type { MaskLayer } from "@bitgrain/engine/grading/mask/mask-types";
import { syncWorkerBrushes } from "../../grading/editor/worker-brush-sync";
import { spawnTransformWorker } from "@bitgrain/engine/core/spawn-transform-worker";

export interface LoopFrameWorker {
  process: (params: Record<string, unknown>) => Promise<WorkerResult>;
  dispose: () => void;
}

interface PendingRequest {
  resolve: (result: WorkerResult) => void;
  reject: (error: Error) => void;
}

const loadBitmap = async (imageUrl: string): Promise<ImageBitmap> => {
  const response = await fetch(imageUrl);
  return createImageBitmap(await response.blob());
};

export const createLoopFrameWorker = async (
  imageUrl: string,
  masks: readonly MaskLayer[] | undefined,
): Promise<LoopFrameWorker> => {
  const worker = spawnTransformWorker();
  const pending = new Map<string, PendingRequest>();
  let nextId = 0;

  const failAll = (error: Error): void => {
    for (const request of pending.values()) request.reject(error);
    pending.clear();
  };

  worker.onmessage = (event: MessageEvent) => {
    if (event.data?.type !== "result") return;
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id);
    request.resolve(event.data as WorkerResult);
  };
  worker.onerror = (event) => failAll(new Error(event.message || "Loop frame worker failed"));

  try {
    const bitmap = await loadBitmap(imageUrl);
    worker.postMessage({ type: "setImage", bitmap }, [bitmap]);
    await syncWorkerBrushes(worker, masks);
  } catch (error) {
    worker.terminate();
    throw error;
  }

  const process = (params: Record<string, unknown>): Promise<WorkerResult> =>
    new Promise<WorkerResult>((resolve, reject) => {
      nextId += 1;
      const id = `loop-${nextId}`;
      pending.set(id, { resolve, reject });
      worker.postMessage({ type: "process", id, params });
    });

  const dispose = (): void => {
    worker.terminate();
    failAll(new DOMException("Loop render stopped", "AbortError"));
  };

  return { process, dispose };
};
