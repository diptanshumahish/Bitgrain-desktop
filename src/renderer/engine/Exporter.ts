import { PREFIXES, MIDS, SUFFIXES } from './FilenameConstants';
import { applyPngWatermark } from './watermark';
import { encodeImage } from './export/export-client';
import { EXTENSION_BY_FORMAT, type ExportFormat } from './export/export-types';
import { applyPrintFinishToCanvas, type PrintFinishOptions } from './print-finish';

const RGBA_STRIDE = 4;
const BYTE_MAX = 255;
const DEFAULT_TOLERANCE = 12;
const DEFAULT_BG = '#fdf6e3';
const HEX_SLICE_START = 2;
const HEX_SLICE_END = 6;
const MAX_CANVAS_FIT_ATTEMPTS = 8;
const CANVAS_FIT_FACTOR = 0.75;
const HARD_MAX_DIMENSION = 16384;

const generateWeirdFilename = (): string => {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const middle = MIDS[Math.floor(Math.random() * MIDS.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const hex = Math.random().toString(16).slice(HEX_SLICE_START, HEX_SLICE_END);
  return `${prefix}_${middle}_${suffix}__${hex}`;
};

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & BYTE_MAX, (value >> 8) & BYTE_MAX, value & BYTE_MAX];
}

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
}

export const encodeAndDownload = async (
  canvas: HTMLCanvasElement,
  options: RasterEncodeOptions,
  onProgress?: (value: number) => void,
): Promise<void> => {
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
  triggerBlobDownload(blob, `${generateWeirdFilename()}.${extension}`);
};

export const downloadSvg = (
  canvas: HTMLCanvasElement,
  _filename?: string,
  transparent = false,
  bgColor = DEFAULT_BG,
): void => {
  const filename = generateWeirdFilename();
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const [bgR, bgG, bgB] = hexToRgb(bgColor);

  const isBg = (red: number, green: number, blue: number): boolean =>
    Math.abs(red - bgR) <= DEFAULT_TOLERANCE &&
    Math.abs(green - bgG) <= DEFAULT_TOLERANCE &&
    Math.abs(blue - bgB) <= DEFAULT_TOLERANCE;

  const colorPaths = new Map<string, string>();

  for (let y = 0; y < height; y++) {
    let runStart = -1;
    let runColor = '';

    for (let x = 0; x <= width; x++) {
      let pixelColor = '';

      if (x < width) {
        const pixelIndex = (y * width + x) * RGBA_STRIDE;
        const red = pixels[pixelIndex];
        const green = pixels[pixelIndex + 1];
        const blue = pixels[pixelIndex + 2];
        const alpha = pixels[pixelIndex + 3];

        const skipBg = transparent && isBg(red, green, blue);
        const skipBlack = !transparent && red === 0 && green === 0 && blue === 0;

        if (alpha > 0 && !skipBlack && !skipBg) {
          pixelColor = `rgb(${red},${green},${blue})`;
        }
      }

      if (pixelColor === runColor && pixelColor !== '') continue;

      if (runStart >= 0 && runColor) {
        const runLength = x - runStart;
        const segment = `M${runStart},${y}h${runLength}v1h-${runLength}z`;
        const existing = colorPaths.get(runColor);
        colorPaths.set(runColor, existing ? existing + segment : segment);
      }

      if (pixelColor) {
        runStart = x;
        runColor = pixelColor;
      } else {
        runStart = -1;
        runColor = '';
      }
    }
  }

  let paths = '';
  for (const [color, pathData] of colorPaths) {
    paths += `<path fill="${color}" d="${pathData}"/>\n`;
  }

  const bgRect = transparent ? '' : `<rect width="100%" height="100%" fill="#000"/>\n`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
${bgRect}${paths}</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  triggerBlobDownload(blob, `${filename}.svg`);
};
