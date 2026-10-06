import type { EncodeRequest, EncodeResponse, ExportFormat } from "./export-types";
import { MIME_BY_FORMAT } from "./export-types";
import { applyTransparencyKey, encodePng, encodeHdrPngWithProgress } from "./encode-image";

export interface EncodeParams {
  format: ExportFormat;
  quality: number;
  transparent: boolean;
  bgColor: string;
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
  peakNits?: number;
  lossless?: boolean;
}

type ProgressFn = (value: number) => void;

interface PendingJob {
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
  onProgress?: ProgressFn;
}

const workerSupported =
  typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";

let sharedWorker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, PendingJob>();

const handleMessage = (event: MessageEvent<EncodeResponse>): void => {
  const message = event.data;
  const job = pending.get(message.id);
  if (!job) return;
  if (message.type === "progress") {
    job.onProgress?.(message.value);
    return;
  }
  pending.delete(message.id);
  if (message.type === "done") {
    job.resolve(new Blob([message.bytes], { type: message.mime }));
  } else {
    job.reject(new Error(message.message));
  }
};

const getWorker = (): Worker | null => {
  if (sharedWorker) return sharedWorker;
  try {
    sharedWorker = new Worker(new URL("./encode.worker.ts", import.meta.url), {
      type: "module",
    });
    sharedWorker.onmessage = handleMessage;
    sharedWorker.onerror = () => {
      for (const [id, job] of pending) {
        job.reject(new Error("Export worker crashed"));
        pending.delete(id);
      }
      sharedWorker?.terminate();
      sharedWorker = null;
    };
    return sharedWorker;
  } catch {
    return null;
  }
};

const encodeViaMainCanvas = (
  data: Uint8ClampedArray<ArrayBuffer>,
  width: number,
  height: number,
  mime: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("No 2d context"));
      return;
    }
    ctx.putImageData(new ImageData(data, width, height), 0, 0);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))),
      mime,
      quality,
    );
  });

const encodeOnMain = async (
  params: EncodeParams,
  onProgress?: ProgressFn,
): Promise<Blob> => {
  const { data, width, height, format, quality, transparent, bgColor, peakNits, lossless } = params;
  if (transparent && format !== "jpeg") applyTransparencyKey(data, bgColor);
  onProgress?.(0.1);
  if (format === "png") {
    const bytes = encodePng(data, width, height, quality, lossless ?? false, onProgress);
    return new Blob([bytes], { type: MIME_BY_FORMAT.png });
  }
  if (format === "png-hdr") {
    const bytes = encodeHdrPngWithProgress(data, width, height, peakNits, onProgress);
    return new Blob([bytes], { type: MIME_BY_FORMAT["png-hdr"] });
  }
  const blob = await encodeViaMainCanvas(data, width, height, MIME_BY_FORMAT[format], quality);
  onProgress?.(1);
  return blob;
};

export function encodeImage(params: EncodeParams, onProgress?: ProgressFn): Promise<Blob> {
  const worker = workerSupported ? getWorker() : null;
  if (!worker) return encodeOnMain(params, onProgress);

  const id = nextId;
  nextId += 1;
  const request: EncodeRequest = {
    id,
    format: params.format,
    quality: params.quality,
    transparent: params.transparent,
    bgColor: params.bgColor,
    width: params.width,
    height: params.height,
    buffer: params.data.buffer,
    peakNits: params.peakNits,
    lossless: params.lossless,
  };

  return new Promise<Blob>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress });
    worker.postMessage(request, [request.buffer]);
  });
}
