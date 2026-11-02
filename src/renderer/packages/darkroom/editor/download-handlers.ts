import { encodeAndDownload } from "@bitgrain/engine/export/exporter";
import { trackEvent as trackPosthog } from "@bitgrain/platform/analytics";
import { trackEvent } from "@bitgrain/platform/tracker";
import { renderForExport } from "../preview/export-render";
import { waitForFullPreview } from "../preview/progressive/full-preview-gate";
import { imageMetaSignal } from "../state/image-store";
import { resolvePrintFinish } from "./export/resolve-print-finish";
import { currentExportBaseName } from "./export/export-filename";

import {
  reportProgress,
  finishProgress,
  setExportProgress,
  INDETERMINATE,
} from "@bitgrain/engine/export/export-progress";
import type { ExportFormat } from "@bitgrain/engine/export/export-types";
import type { TransformMode, DitherMethod } from "@bitgrain/engine/core/types";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { editorPaperColor } from "./preview/editor-colors";
import { shouldWatermarkExport } from "./export/plain-conversion/should-watermark-export";

interface RasterDownloadArgs {
  format: ExportFormat;
  scale: number;
  transparent: boolean;
  bgColor: string;
  lutId: string | null;
  isSample: boolean;
  modes: TransformMode[];
  resolution: number;
  contrast: number;
  brightness: number;
  saturation: number;
  grain: number;
  ditherMethod: DitherMethod;
  ditherFactor: number;
  watermark: boolean;
  quality: number;
  plan: string;
}

const CANVAS_ID = "transformation-output-canvas";
const EXPORT_HARD_MAX = 16384;
const FULL_PREVIEW_WAIT_MS = 15_000;

interface ResolvedExport {
  canvas: HTMLCanvasElement | null;
  isFallback: boolean;
}

const clampScaleToLongEdge = (
  canvas: HTMLCanvasElement,
  scale: number,
  maxLongEdge: number | null,
): number => {
  if (!maxLongEdge) return scale;
  const longEdge = Math.max(canvas.width, canvas.height) * scale;
  if (longEdge <= maxLongEdge) return scale;
  return scale * (maxLongEdge / longEdge);
};

const getNativeExportScale = (canvasWidth: number, userScale: number): number => {
  const meta = imageMetaSignal.value;
  if (!meta || canvasWidth <= 0) return userScale;
  return (meta.width / canvasWidth) * userScale;
};

const settledPreviewCanvas = async (): Promise<HTMLCanvasElement | null> => {
  const settled = await waitForFullPreview(FULL_PREVIEW_WAIT_MS);
  return settled ? (document.getElementById(CANVAS_ID) as HTMLCanvasElement | null) : null;
};

export const resolveExportCanvas = async (
  bgColor: string,
  renderScale: number,
): Promise<ResolvedExport> => {
  try {
    const { canvas } = await renderForExport({ fgColor: "#000000", bgColor }, renderScale);
    return { canvas, isFallback: false };
  } catch (error) {
    console.error("export render failed, falling back to the full quality preview:", error);
    return { canvas: await settledPreviewCanvas(), isFallback: true };
  }
};

export const resolveRenderScale = (plan: string, userScale: number): number => {
  const previewCanvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (!previewCanvas) return getNativeExportScale(0, userScale);
  const nativeScale = getNativeExportScale(previewCanvas.width, userScale);
  let renderScale = clampScaleToLongEdge(previewCanvas, nativeScale, getPlanLimits(plan).maxExportLongEdge);
  const longEdge = Math.max(previewCanvas.width, previewCanvas.height) * renderScale;
  if (longEdge > EXPORT_HARD_MAX) renderScale *= EXPORT_HARD_MAX / longEdge;
  return renderScale;
};

export const resolveEncodeScale = (canvas: HTMLCanvasElement, renderScale: number): number => {
  const previewCanvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  const producedLongEdge = Math.max(canvas.width, canvas.height);
  if (!previewCanvas || producedLongEdge <= 0) return renderScale;
  const wantedLongEdge = Math.max(previewCanvas.width, previewCanvas.height) * renderScale;
  return wantedLongEdge / producedLongEdge;
};

export const triggerRasterDownload = async (args: RasterDownloadArgs): Promise<boolean> => {
  const {
    format, scale, transparent, bgColor, lutId, isSample,
    modes, resolution, contrast, brightness, saturation, grain,
    ditherMethod, ditherFactor, watermark, quality, plan,
  } = args;

  reportProgress("rendering", INDETERMINATE);
  const renderScale = resolveRenderScale(plan, scale);
  const resolved = await resolveExportCanvas(bgColor, renderScale);
  const canvas = resolved.canvas;
  if (!canvas) {
    setExportProgress(null);
    return false;
  }

  reportProgress("scaling", INDETERMINATE);
  const encodeScale = resolveEncodeScale(canvas, renderScale);

  const printFinish = resolvePrintFinish(resolved.isFallback, bgColor);

  try {
    await encodeAndDownload(
      canvas,
      { format, scale: encodeScale, transparent, bgColor, watermark, quality, printFinish, filenameBase: currentExportBaseName() },
      (value) => reportProgress("encoding", value),
    );
    finishProgress();
  } catch (error) {
    setExportProgress(null);
    trackEvent("home", `export_${format}_error`, {
      details: { message: error instanceof Error ? error.message : "unknown" },
    });
    return false;
  }

  trackPosthog("home:export_downloaded", {
    format,
    transform_modes: lutId ? ["lut"] : modes,
    is_sample: isSample,
    scale, transparent, lut_id: lutId,
    resolution, contrast, brightness, saturation, grain,
    dither_method: ditherMethod,
    dither_factor: ditherFactor,
    quality: format === "png" ? undefined : quality,
  });
  trackEvent("home", `export_${format}`, {
    details: { is_sample: isSample, scale, transparent },
  });
  if (watermark && !isSample) {
    trackPosthog("home:watermark_gate_shown", { context: "image_export", format, plan });
  }
  return true;
};

interface PlatformDownloadArgs {
  presetId: string;
  format: ExportFormat;
  targetWidth: number;
  targetHeight: number;
  transparent: boolean;
  plan: string;
}

export const triggerPlatformDownload = async (args: PlatformDownloadArgs): Promise<boolean> => {
  const { presetId, format, targetWidth, targetHeight, transparent, plan } = args;
  const limits = getPlanLimits(plan);
  const watermark = shouldWatermarkExport(plan);
  const bgColor = editorPaperColor();

  let width = targetWidth;
  let height = targetHeight;
  if (limits.maxExportLongEdge) {
    const longest = Math.max(width, height);
    if (longest > limits.maxExportLongEdge) {
      const fit = limits.maxExportLongEdge / longest;
      width = Math.max(1, Math.round(width * fit));
      height = Math.max(1, Math.round(height * fit));
    }
  }

  reportProgress("rendering", INDETERMINATE);
  const resolved = await resolveExportCanvas(bgColor, 1);
  const canvas = resolved.canvas;
  if (!canvas) {
    setExportProgress(null);
    return false;
  }

  const printFinish = resolvePrintFinish(resolved.isFallback, bgColor);

  reportProgress("scaling", INDETERMINATE);
  try {
    await encodeAndDownload(
      canvas,
      {
        format, scale: 1, transparent, bgColor, watermark, quality: 1, printFinish,
        target: { width, height }, filenameBase: `${currentExportBaseName()}-${presetId}`,
      },
      (value) => reportProgress("encoding", value),
    );
    finishProgress();
  } catch {
    setExportProgress(null);
    return false;
  }

  trackPosthog("home:export_downloaded", { format, platform_preset: presetId, width, height, plan });
  trackEvent("home", `export_platform_${format}`, {
    details: { preset: presetId, width, height },
  });
  if (watermark) {
    trackPosthog("home:watermark_gate_shown", { context: "platform_export", preset: presetId, plan });
  }
  return true;
};
