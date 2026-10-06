import { encodeAndDownload, downloadSvg, triggerBlobDownload } from "../../engine/Exporter";
import { trackEvent as trackPosthog } from "../../lib/analytics";
import { trackEvent } from "../../lib/tracker";
import { emitModal } from "../../lib/event-bus";
import { renderForExport, renderAsciiSvgForExport } from "../../components/output-preview/export-render";
import { imageMetaSignal } from "../../store/image-store";
import { printFinishSignal, printFinishStrengthSignal, modesSignal } from "../../store/transform-store";
import { buildPrintFinishOptions } from "../../engine/print-finish";
import {
  reportProgress,
  finishProgress,
  setExportProgress,
  INDETERMINATE,
} from "../../engine/export/export-progress";
import type { ExportFormat } from "../../engine/export/export-types";
import type { TransformMode, DitherMethod } from "../../engine/types";
import { getPlanLimits } from "../../config/plan-limits";
import { registerWatermarkedExport, shouldPromptUpgrade } from "../../utils/upgrade-prompt";

export interface RasterDownloadArgs {
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
const PAPER_COLOR = "#fdf6e3";
const POST_EXPORT_PROMPT_DELAY_MS = 700;

const promptUpgradeAfterExport = (requestedLongEdge: number, deliveredLongEdge: number): void => {
  if (!shouldPromptUpgrade(registerWatermarkedExport())) return;
  setTimeout(() => {
    emitModal({ type: "post-export-upgrade", requestedLongEdge, deliveredLongEdge });
  }, POST_EXPORT_PROMPT_DELAY_MS);
};

interface ResolvedExport {
  canvas: HTMLCanvasElement | null;
  renderedAtScale: number;
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

const resolveExportCanvas = async (
  bgColor: string,
  renderScale: number,
): Promise<ResolvedExport> => {
  try {
    const { canvas, renderedAtScale } = await renderForExport({ fgColor: "#000000", bgColor }, renderScale);
    return { canvas, renderedAtScale, isFallback: false };
  } catch {
    return {
      canvas: document.getElementById(CANVAS_ID) as HTMLCanvasElement | null,
      renderedAtScale: 1,
      isFallback: true,
    };
  }
};

const resolveRenderScale = (plan: string, userScale: number): number => {
  const previewCanvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (!previewCanvas) return getNativeExportScale(0, userScale);
  const nativeScale = getNativeExportScale(previewCanvas.width, userScale);
  let renderScale = clampScaleToLongEdge(previewCanvas, nativeScale, getPlanLimits(plan).maxExportLongEdge);
  const longEdge = Math.max(previewCanvas.width, previewCanvas.height) * renderScale;
  if (longEdge > EXPORT_HARD_MAX) renderScale *= EXPORT_HARD_MAX / longEdge;
  return renderScale;
};

const measureExportLongEdges = (userScale: number, deliveredScale: number): [number, number] => {
  const previewCanvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (!previewCanvas) return [0, 0];
  const baseLongEdge = Math.max(previewCanvas.width, previewCanvas.height);
  const nativeScale = getNativeExportScale(previewCanvas.width, userScale);
  return [Math.round(baseLongEdge * nativeScale), Math.round(baseLongEdge * deliveredScale)];
};

export const triggerRasterDownload = async (args: RasterDownloadArgs): Promise<void> => {
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
    return;
  }

  reportProgress("scaling", INDETERMINATE);
  const encodeScale = resolved.renderedAtScale > 0 ? renderScale / resolved.renderedAtScale : renderScale;

  const printFinish = printFinishSignal.value && !resolved.isFallback && modes[modes.length - 1] !== "ascii" && modes[modes.length - 1] !== "braille"
    ? buildPrintFinishOptions(printFinishStrengthSignal.value, bgColor)
    : null;

  try {
    await encodeAndDownload(
      canvas,
      { format, scale: encodeScale, transparent, bgColor, watermark, quality, printFinish },
      (value) => reportProgress("encoding", value),
    );
    finishProgress();
  } catch (error) {
    setExportProgress(null);
    trackEvent("home", `export_${format}_error`, {
      details: { message: error instanceof Error ? error.message : "unknown" },
    });
    return;
  }

  trackPosthog("export_downloaded", {
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
    trackPosthog("watermark_gate_shown", { context: "image_export", format, plan });
    const [requestedLongEdge, deliveredLongEdge] = measureExportLongEdges(scale, renderScale);
    promptUpgradeAfterExport(requestedLongEdge, deliveredLongEdge);
  }
};

interface SvgDownloadArgs {
  transparent: boolean;
  bgColor: string;
  isSample: boolean;
  modes: TransformMode[];
  ditherMethod: DitherMethod;
  plan: string;
}

export const triggerSvgDownload = async ({
  transparent, bgColor, isSample, modes, ditherMethod, plan,
}: SvgDownloadArgs): Promise<void> => {
  if (!isSample && !getPlanLimits(plan).allowSvgExport) {
    trackPosthog("payment_modal_opened", { trigger: "svg_export" });
    trackEvent("payment", "modal_opened", { details: { trigger: "svg_export" } });
    emitModal({ type: "studio-payment" });
    return;
  }

  reportProgress("rendering", INDETERMINATE);

  // ASCII exports as real <text> glyphs (tiny, crisp, pen-plotter ready) rather than a pixel trace.
  if (modes[modes.length - 1] === "ascii") {
    const svg = await renderAsciiSvgForExport(transparent);
    reportProgress("encoding", INDETERMINATE);
    triggerBlobDownload(
      new Blob([svg], { type: "image/svg+xml" }),
      `bitgrain-ascii-${Date.now()}.svg`,
    );
    finishProgress();
    trackPosthog("export_downloaded", {
      format: "svg",
      transform_modes: modes,
      is_sample: isSample,
      transparent,
      dither_method: ditherMethod,
    });
    trackEvent("home", "export_svg", { details: { is_sample: isSample, transparent } });
    return;
  }

  const resolved = await resolveExportCanvas(bgColor, 1);
  const canvas = resolved.canvas;
  if (!canvas) {
    setExportProgress(null);
    return;
  }

  reportProgress("encoding", INDETERMINATE);
  downloadSvg(canvas, `bitgrain-${modes.join("+")}-${Date.now()}`, transparent, bgColor);
  finishProgress();

  trackPosthog("export_downloaded", {
    format: "svg",
    transform_modes: modes,
    is_sample: isSample,
    transparent,
    dither_method: ditherMethod,
  });
  trackEvent("home", "export_svg", {
    details: { is_sample: isSample, transparent },
  });
};

export interface PlatformDownloadArgs {
  presetId: string;
  format: ExportFormat;
  targetWidth: number;
  targetHeight: number;
  transparent: boolean;
  plan: string;
}

// triggerPlatformDownload exports the current look cropped to an exact platform size (cover-fit,
// center-cropped). Free plans get the watermark and a clamp to their max long edge; paid plans
// get the exact dimensions, clean. The clamp preserves the preset's aspect ratio.
export const triggerPlatformDownload = async (args: PlatformDownloadArgs): Promise<void> => {
  const { presetId, format, targetWidth, targetHeight, transparent, plan } = args;
  const limits = getPlanLimits(plan);
  const watermark = limits.watermark;
  const bgColor = PAPER_COLOR;

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
    return;
  }

  const printFinish = printFinishSignal.value && !resolved.isFallback && modesSignal.value[modesSignal.value.length - 1] !== "ascii" && modesSignal.value[modesSignal.value.length - 1] !== "braille"
    ? buildPrintFinishOptions(printFinishStrengthSignal.value, bgColor)
    : null;

  reportProgress("scaling", INDETERMINATE);
  try {
    await encodeAndDownload(
      canvas,
      { format, scale: 1, transparent, bgColor, watermark, quality: 1, printFinish, target: { width, height } },
      (value) => reportProgress("encoding", value),
    );
    finishProgress();
  } catch {
    setExportProgress(null);
    return;
  }

  trackPosthog("export_downloaded", { format, platform_preset: presetId, width, height, plan });
  trackEvent("home", `export_platform_${format}`, {
    details: { preset: presetId, width, height },
  });
  if (watermark) {
    trackPosthog("watermark_gate_shown", { context: "platform_export", preset: presetId, plan });
    promptUpgradeAfterExport(Math.max(targetWidth, targetHeight), Math.max(width, height));
  }
};
