import type { TransformMode, DitherMethod, Palette } from "../../engine/types";
import type { CompactCacheEntry, WorkerResult } from "./types";

export const compactCache = new Map<string, CompactCacheEntry>();

export const makeCompactKey = (
  image: string,
  resolution: number,
  contrast: number,
  brightness: number,
  saturation: number,
  mode: TransformMode | TransformMode[],
  ditherMethod: DitherMethod | undefined,
  ditherFactor: number,
  isColor: boolean,
  noise: number,
  hue: number,
  palette: Palette | undefined,
  lutId: string | undefined,
  fgColor: string,
  bgColor: string,
  hazeIntensity: number,
  bloomIntensity: number,
  bloomThreshold: number,
  hazeWarmth: number,
): string => JSON.stringify([
  image, resolution, contrast, brightness, saturation,
  mode, ditherMethod, ditherFactor, isColor, noise, hue,
  palette, lutId, fgColor, bgColor,
  hazeIntensity, bloomIntensity, bloomThreshold, hazeWarmth,
]);

let sharedPreviewWorker: Worker | null = null;
const sharedPreviewWorkerCallbacks = new Map<string, (result: WorkerResult) => void>();

export const getSharedPreviewWorker = (): Worker => {
  if (sharedPreviewWorker) return sharedPreviewWorker;
  sharedPreviewWorker = new Worker(
    new URL("../../engine/transform.worker.ts", import.meta.url),
    { type: "module" }
  );
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
