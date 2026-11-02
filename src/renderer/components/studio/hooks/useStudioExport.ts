import type { TemplateDef, Layer } from "../../../data/studioTypes";
import { trackEvent } from "../../../lib/analytics";
import { applyPngWatermark } from "../../../engine/watermark";
import { canvasToHdrBlob } from "../../../engine/export/hdr-png-encoder";
import { STUDIO_HDR_FORMAT } from "../panels/export-state";
import { renderToCanvas } from "./export/render-canvas";
import { toDesignFileName } from "../../../lib/design-file-name";
import { studioWorkNameSignal } from "../../../store/studio-work-name";
import {
  reportProgress,
  finishProgress,
  setExportProgress,
  INDETERMINATE,
} from "../../../engine/export/export-progress";

const downloadFromUrl = (url: string, filename: string, revoke: boolean): void => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  if (revoke) URL.revokeObjectURL(url);
};

const extensionForFormat = (format: string): string => {
  if (format === STUDIO_HDR_FORMAT) return "png";
  return format.split("/")[1] || "png";
};

// Reduce a PNG's file size by posterizing each colour channel to fewer levels
// (fewer distinct colours → much smaller PNG). `quality` 1.0 is lossless; lower
// values trade colour fidelity for size. Alpha is left untouched.
const posterizeForPng = (canvas: HTMLCanvasElement, quality: number): void => {
  if (quality >= 0.99) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const levels = Math.max(2, Math.round(quality * 64));
  const step = 255 / (levels - 1);
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) lut[i] = Math.round(Math.round(i / step) * step);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
  ctx.putImageData(image, 0, 0);
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

  trackEvent("studio_export_started", {
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
      // PNG is lossless, so `quality` does nothing on toDataURL. To give it a real
      // size lever we posterize the pixels first: fewer distinct colours compress
      // far better. Full quality (>=0.99) stays untouched (truly lossless).
      if (format === "image/png") posterizeForPng(canvas, quality);
      const url = canvas.toDataURL(format, quality);
      downloadFromUrl(url, filename, false);
    }

    finishProgress();
  } catch (error) {
    setExportProgress(null);
    throw error;
  }

  trackEvent("studio_export_completed", {
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
