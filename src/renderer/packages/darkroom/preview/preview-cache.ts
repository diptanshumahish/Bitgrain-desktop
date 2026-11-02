import type { CompactCacheEntry, OutputPreviewProps, WorkerResult } from "@bitgrain/engine/preview/types";
import { spawnTransformWorker } from "@bitgrain/engine/core/spawn-transform-worker";

const MAX_COMPACT_ENTRIES = 96;

const entries = new Map<string, CompactCacheEntry>();

export const rememberCompact = (key: string, entry: CompactCacheEntry): void => {
  entries.delete(key);
  entries.set(key, entry);
  if (entries.size <= MAX_COMPACT_ENTRIES) return;
  const oldest = entries.keys().next().value;
  if (oldest !== undefined) entries.delete(oldest);
};

export const makeCompactKey = (props: OutputPreviewProps, params: Record<string, unknown>): string =>
  JSON.stringify([
    props.image, params, props.fgColor, props.bgColor, props.paperColor ?? null,
    props.asciiTone ?? null, props.printFinish ?? false, props.printFinishStrength ?? null,
  ]);

export const paintCachedCompact = (canvas: HTMLCanvasElement | null, key: string): boolean => {
  const cached = entries.get(key);
  if (!cached) return false;
  if (!canvas) return true;
  canvas.width = cached.w;
  canvas.height = cached.h;
  canvas.getContext("2d")?.putImageData(new ImageData(new Uint8ClampedArray(cached.data), cached.w, cached.h), 0, 0);
  return true;
};

export const storeCompactCanvas = (key: string, canvas: HTMLCanvasElement): void => {
  const context = canvas.getContext("2d");
  if (!context || canvas.width === 0 || canvas.height === 0) return;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  rememberCompact(key, { data: imageData.data, w: canvas.width, h: canvas.height });
};

let sharedPreviewWorker: Worker | null = null;
const sharedPreviewWorkerCallbacks = new Map<string, (result: WorkerResult) => void>();

export const getSharedPreviewWorker = (): Worker => {
  if (sharedPreviewWorker) return sharedPreviewWorker;
  sharedPreviewWorker = spawnTransformWorker();
  sharedPreviewWorker.onmessage = (e: MessageEvent) => {
    if (e.data.type === "result") {
      const { id } = e.data;
      const cb = sharedPreviewWorkerCallbacks.get(id);
      if (cb) {
        cb(e.data);
        sharedPreviewWorkerCallbacks.delete(id);
      }
    }
  };
  return sharedPreviewWorker;
};

export const registerSharedWorkerCallback = (
  id: string,
  cb: (result: WorkerResult) => void,
): void => {
  sharedPreviewWorkerCallbacks.set(id, cb);
};
