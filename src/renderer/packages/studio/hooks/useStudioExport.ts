import type { TemplateDef, Layer } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/analytics";
import { applyPngWatermark } from "@bitgrain/engine/watermark/watermark";
import { canvasToHdrBlob } from "@bitgrain/engine/export/hdr-png-encoder";
import { STUDIO_HDR_FORMAT } from "../panels/export-state";
import { renderToCanvas } from "@bitgrain/studio-core/render/render-canvas";
import { toDesignFileName } from "../io/design-file-name";
import { studioWorkNameSignal } from "../state/studio-work-name";
import {
  reportProgress,
  finishProgress,
  setExportProgress,
  INDETERMINATE,
} from "@bitgrain/engine/export/export-progress";

const REVOKE_DELAY_MS = 1000;
const EMPTY_DATA_URL = "data:,";
const OPAQUE_BACKDROP = "#ffffff";
const JPEG_FORMAT = "image/jpeg";

const downloadFromUrl = (url: string, filename: string, revoke: boolean): void => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  if (revoke) window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

const extensionForFormat = (format: string): string => {
  if (format === STUDIO_HDR_FORMAT) return "png";
  if (format === JPEG_FORMAT) return "jpg";
  return format.split("/")[1] || "png";
};

const flattenOntoBackdrop = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const context = flat.getContext("2d");
  if (!context) return canvas;
  context.fillStyle = OPAQUE_BACKDROP;
  context.fillRect(0, 0, flat.width, flat.height);
  context.drawImage(canvas, 0, 0);
  return flat;
};

const PNG_FORMAT = "image/png";
const LOSSLESS_QUALITY = 0.99;
const MAX_PNG_LEVELS = 64;
const CHANNEL_MAX = 255;

// Desktop (PORTED.md): PNG ignores `quality`, so lower quality posterizes each
// colour channel to fewer levels, which compresses far smaller. Alpha is kept.
const posterizeForPng = (canvas: HTMLCanvasElement, quality: number): void => {
  const context = canvas.getContext("2d");
  if (!context || quality >= LOSSLESS_QUALITY) return;
  const levels = Math.max(2, Math.round(quality * MAX_PNG_LEVELS));
  const step = CHANNEL_MAX / (levels - 1);
  const table = new Uint8ClampedArray(CHANNEL_MAX + 1);
  for (let index = 0; index <= CHANNEL_MAX; index++) table[index] = Math.round(Math.round(index / step) * step);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    image.data[index] = table[image.data[index]];
    image.data[index + 1] = table[image.data[index + 1]];
    image.data[index + 2] = table[image.data[index + 2]];
  }
  context.putImageData(image, 0, 0);
};

const encodeCanvas = (canvas: HTMLCanvasElement, format: string, quality: number): string => {
  if (format === PNG_FORMAT) posterizeForPng(canvas, quality);
  const source = format === JPEG_FORMAT ? flattenOntoBackdrop(canvas) : canvas;
  const url = source.toDataURL(format, quality);
  if (url === EMPTY_DATA_URL) throw new Error("This export size is too large for your browser. Try a smaller size.");
  return url;
};

export const exportStudio = async (
  template: TemplateDef,
  background: string,
  layers: Layer[],
  imageDataUrl: string | null,
  outW?: number,
  outH?: number,
  format: string = "image/png",
  quality: number = 0.92,
  watermark: boolean = false,
): Promise<void> => {
  const startTime = Date.now();
  const targetW = outW ?? template.width * template.exportScale;
  const targetH = outH ?? template.height * template.exportScale;

  trackEvent("studio:export_started", {
    template_id: template.id,
    format,
    quality,
    width: targetW,
    height: targetH,
    layer_count: layers.length,
  });

  try {
    reportProgress("rendering", INDETERMINATE);
    const canvas = await renderToCanvas(
      template, background, layers, imageDataUrl, targetW, targetH,
    );

    if (watermark) {
      await applyPngWatermark(canvas);
    }

    reportProgress("encoding", INDETERMINATE);
    const ext = extensionForFormat(format);
    const filename = `${toDesignFileName(studioWorkNameSignal.value)}.${ext}`;

    if (format === STUDIO_HDR_FORMAT) {
      const blob = await canvasToHdrBlob(canvas);
      const url = URL.createObjectURL(blob);
      downloadFromUrl(url, filename, true);
    } else {
      downloadFromUrl(encodeCanvas(canvas, format, quality), filename, false);
    }

    finishProgress();
  } catch (error) {
    setExportProgress(null);
    throw error;
  }

  trackEvent("studio:export_completed", {
    template_id: template.id,
    format,
    duration_ms: Date.now() - startTime,
  });
};

export const renderStudioToDataUrl = async (
  template: TemplateDef,
  background: string,
  layers: Layer[],
  imageDataUrl: string | null,
  outW?: number,
  outH?: number,
): Promise<string> => {
  const targetW = outW ?? template.width;
  const targetH = outH ?? template.height;
  const canvas = await renderToCanvas(
    template, background, layers, imageDataUrl, targetW, targetH,
  );
  return canvas.toDataURL("image/png");
};
