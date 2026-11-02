import {
  getSharedPreviewWorker,
  registerSharedWorkerCallback,
} from "../output-preview/preview-cache";
import type { WorkerResult } from "../output-preview/types";
import type { Palette, TransformMode, DitherMethod } from "../../engine/types";

export interface PrerenderSpec {
  image: string;
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  mode: TransformMode | TransformMode[];
  ditherMethod?: DitherMethod;
  ditherFactor?: number;
  isColor: boolean;
  noise?: number;
  hue?: number;
  palette?: Palette;
  halftoneCell?: number;
  halftoneLines?: number;
  halftoneAngle?: number;
  halftoneStyle?: "mono" | "color" | "cmyk";
  halftoneInvert?: boolean;
  popartCell?: number;
  popartAngle?: number;
  popartThreshold?: number;
  popartGrain?: number;
  popartSpatter?: number;
  popartInk?: [number, number, number];
  popartPaper?: [number, number, number];
}

const RENDER_QUALITY = 0.85;
const MAX_CACHE_ENTRIES = 64;

const urlCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

const evictOldest = (): void => {
  while (urlCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = urlCache.keys().next().value;
    if (oldestKey === undefined) break;
    const url = urlCache.get(oldestKey);
    if (url) URL.revokeObjectURL(url);
    urlCache.delete(oldestKey);
  }
};

const cacheKey = (spec: PrerenderSpec): string => {
  const modes = Array.isArray(spec.mode) ? spec.mode : [spec.mode];
  return [
    spec.image,
    spec.resolution,
    spec.contrast,
    spec.brightness,
    spec.saturation,
    modes.join("|"),
    spec.ditherMethod ?? "",
    spec.ditherFactor ?? 1,
    spec.isColor ? 1 : 0,
    spec.noise ?? 0,
    spec.hue ?? 0,
    spec.palette?.id ?? "",
    spec.halftoneCell ?? 0,
    spec.halftoneLines ?? 0,
    spec.halftoneAngle ?? 0,
    spec.halftoneStyle ?? "",
    spec.halftoneInvert ? 1 : 0,
    spec.popartCell ?? 0,
    spec.popartAngle ?? 0,
    spec.popartThreshold ?? 0,
    spec.popartGrain ?? 0,
    spec.popartSpatter ?? 0,
    spec.popartInk?.join(",") ?? "",
    spec.popartPaper?.join(",") ?? "",
  ].join("·");
};

const canvasToObjectUrl = (canvas: HTMLCanvasElement): Promise<string> =>
  new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? URL.createObjectURL(blob) : ""),
      "image/webp",
      RENDER_QUALITY,
    );
  });

const loadBitmap = async (src: string): Promise<ImageBitmap> => {
  const response = await fetch(src);
  const blob = await response.blob();
  return createImageBitmap(blob);
};

const runRender = async (spec: PrerenderSpec): Promise<string> => {
  const bitmap = await loadBitmap(spec.image);
  const worker = getSharedPreviewWorker();
  const id = `pr-${Math.random().toString(36).slice(2, 10)}`;
  const modes = Array.isArray(spec.mode) ? spec.mode : [spec.mode];

  const result = await new Promise<WorkerResult>((resolve) => {
    registerSharedWorkerCallback(id, resolve);
    worker.postMessage(
      {
        type: "process-single",
        id,
        params: {
          resolution: spec.resolution,
          contrast: spec.contrast,
          brightness: spec.brightness,
          saturation: spec.saturation,
          modes,
          ditherMethod: spec.ditherMethod,
          ditherFactor: spec.ditherFactor ?? 1,
          isColor: spec.isColor,
          noise: spec.noise ?? 0,
          hue: spec.hue ?? 0,
          palette: spec.palette,
          halftoneCell: spec.halftoneCell,
          halftoneLines: spec.halftoneLines,
          halftoneAngle: spec.halftoneAngle,
          halftoneStyle: spec.halftoneStyle,
          halftoneInvert: spec.halftoneInvert,
          popartCell: spec.popartCell,
          popartAngle: spec.popartAngle,
          popartThreshold: spec.popartThreshold,
          popartGrain: spec.popartGrain,
          popartSpatter: spec.popartSpatter,
          popartInk: spec.popartInk,
          popartPaper: spec.popartPaper,
        },
        bitmap,
      },
      [bitmap],
    );
  });

  if (!result.colorData) return "";

  const canvas = document.createElement("canvas");
  canvas.width = result.cols;
  canvas.height = result.rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = new ImageData(
    new Uint8ClampedArray(result.colorData),
    result.cols,
    result.rows,
  );
  ctx.putImageData(imageData, 0, 0);
  return canvasToObjectUrl(canvas);
};

export const prerender = (spec: PrerenderSpec): Promise<string> => {
  const key = cacheKey(spec);
  const cached = urlCache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = runRender(spec)
    .then((url) => {
      if (url) {
        evictOldest();
        urlCache.set(key, url);
      }
      inFlight.delete(key);
      return url;
    })
    .catch(() => {
      inFlight.delete(key);
      return "";
    });

  inFlight.set(key, promise);
  return promise;
};

export const peekPrerender = (spec: PrerenderSpec): string | undefined =>
  urlCache.get(cacheKey(spec));
