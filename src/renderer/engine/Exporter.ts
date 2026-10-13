import { applyPngWatermark } from './watermark';
import { encodeImage } from './export/export-client';
import { EXTENSION_BY_FORMAT, type ExportFormat } from './export/export-types';
import { applyPrintFinishToCanvas, type PrintFinishOptions } from './print-finish';

const MAX_CANVAS_FIT_ATTEMPTS = 8;
const CANVAS_FIT_FACTOR = 0.75;
const HARD_MAX_DIMENSION = 16384;
const FALLBACK_FILENAME_BASE = 'bitgrain';

const isCanvasRendered = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
  try {
    return ctx.getImageData(width - 1, height - 1, 1, 1).data[3] !== 0;
  } catch {
    return false;
  }
};

export interface TargetDimensions {
  width: number;
  height: number;
}

const drawCoverFit = (
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  width: number,
  height: number,
): void => {
  ctx.imageSmoothingEnabled = false;
  const coverScale = Math.max(width / source.width, height / source.height);
  const scaledWidth = source.width * coverScale;
  const scaledHeight = source.height * coverScale;
  ctx.drawImage(source, (width - scaledWidth) / 2, (height - scaledHeight) / 2, scaledWidth, scaledHeight);
};

const buildExportCanvas = async (
  canvas: HTMLCanvasElement,
  scale: number,
  watermark: boolean,
  printFinish?: PrintFinishOptions | null,
  target?: TargetDimensions | null,
): Promise<HTMLCanvasElement> => {
  const out = document.createElement('canvas');
  const ctx = out.getContext('2d')!;

  if (target) {
    let { width, height } = target;
    const longest = Math.max(width, height);
    if (longest > HARD_MAX_DIMENSION) {
      const fit = HARD_MAX_DIMENSION / longest;
      width = Math.max(1, Math.floor(width * fit));
      height = Math.max(1, Math.floor(height * fit));
    }
    out.width = width;
    out.height = height;
    drawCoverFit(ctx, canvas, width, height);
  } else {
    let targetWidth = Math.max(1, Math.round(canvas.width * scale));
    let targetHeight = Math.max(1, Math.round(canvas.height * scale));

    const longestSide = Math.max(targetWidth, targetHeight);
    if (longestSide > HARD_MAX_DIMENSION) {
      const fit = HARD_MAX_DIMENSION / longestSide;
      targetWidth = Math.max(1, Math.floor(targetWidth * fit));
      targetHeight = Math.max(1, Math.floor(targetHeight * fit));
    }

    for (let attempt = 0; attempt < MAX_CANVAS_FIT_ATTEMPTS; attempt += 1) {
      out.width = targetWidth;
      out.height = targetHeight;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      if (isCanvasRendered(ctx, targetWidth, targetHeight)) break;
      targetWidth = Math.max(1, Math.floor(targetWidth * CANVAS_FIT_FACTOR));
      targetHeight = Math.max(1, Math.floor(targetHeight * CANVAS_FIT_FACTOR));
    }
  }

  if (printFinish && printFinish.strength > 0) {
    applyPrintFinishToCanvas(out, printFinish);
  }

  if (watermark) {
    await applyPngWatermark(out);
  }
  return out;
};

export interface ExportImageData {
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
}

export const getExportImageData = async (
  canvas: HTMLCanvasElement,
  scale: number,
  watermark: boolean,
  printFinish?: PrintFinishOptions | null,
  target?: TargetDimensions | null,
): Promise<ExportImageData> => {
  const out = await buildExportCanvas(canvas, scale, watermark, printFinish, target);
  const ctx = out.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, out.width, out.height);
  return { data: imageData.data, width: out.width, height: out.height };
};

export const triggerBlobDownload = (blob: Blob, filename: string): void => {
  const bridge = window.bitgrain;
  if (bridge) {
    void blob
      .arrayBuffer()
      .then((buffer) => bridge.saveFile(filename, new Uint8Array(buffer)));
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

export interface RasterEncodeOptions {
  format: ExportFormat;
  scale: number;
  transparent: boolean;
  bgColor: string;
  watermark: boolean;
  quality: number;
  printFinish?: PrintFinishOptions | null;
  target?: TargetDimensions | null;
  filenameBase?: string;
}

export interface EncodedRasterFile {
  blob: Blob;
  filename: string;
}

export const encodeRasterFile = async (
  canvas: HTMLCanvasElement,
  options: RasterEncodeOptions,
  onProgress?: (value: number) => void,
): Promise<EncodedRasterFile> => {
  const { data, width, height } = await getExportImageData(
    canvas,
    options.scale,
    options.watermark,
    options.printFinish,
    options.target,
  );
  const blob = await encodeImage(
    {
      format: options.format,
      quality: options.quality,
      transparent: options.transparent,
      bgColor: options.bgColor,
      width,
      height,
      data,
    },
    onProgress,
  );
  const extension = EXTENSION_BY_FORMAT[options.format];
  return { blob, filename: `${options.filenameBase ?? FALLBACK_FILENAME_BASE}.${extension}` };
};

export const encodeAndDownload = async (
  canvas: HTMLCanvasElement,
  options: RasterEncodeOptions,
  onProgress?: (value: number) => void,
): Promise<void> => {
  const { blob, filename } = await encodeRasterFile(canvas, options, onProgress);
  triggerBlobDownload(blob, filename);
};
