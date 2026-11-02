import { encodeRasterFile } from "@bitgrain/engine/export/exporter";
import {
  reportProgress,
  finishProgress,
  setExportProgress,
  INDETERMINATE,
} from "@bitgrain/engine/export/export-progress";
import { resolveEncodeScale, resolveExportCanvas, resolveRenderScale } from "../../../editor/download-handlers";
import { resolvePrintFinish } from "../../../editor/export/resolve-print-finish";
import { currentExportBaseName } from "../../../editor/export/export-filename";
import type { ExportFormat } from "@bitgrain/engine/export/export-types";
import { editorPaperColor } from "../../../editor/preview/editor-colors";
import { shouldWatermarkExport } from "../../../editor/export/plain-conversion/should-watermark-export";

export interface ShareRenderOptions {
  format: ExportFormat;
  scale: number;
  transparent: boolean;
  quality: number;
  plan: string;
}

export const renderShareFile = async (options: ShareRenderOptions): Promise<File | null> => {
  reportProgress("rendering", INDETERMINATE);
  const renderScale = resolveRenderScale(options.plan, options.scale);
  const paperColor = editorPaperColor();
  const resolved = await resolveExportCanvas(paperColor, renderScale);
  if (!resolved.canvas) {
    setExportProgress(null);
    return null;
  }
  const encodeScale = resolveEncodeScale(resolved.canvas, renderScale);
  try {
    const { blob, filename } = await encodeRasterFile(
      resolved.canvas,
      {
        format: options.format,
        scale: encodeScale,
        transparent: options.transparent,
        bgColor: paperColor,
        watermark: shouldWatermarkExport(options.plan),
        quality: options.quality,
        printFinish: resolvePrintFinish(resolved.isFallback, paperColor),
        filenameBase: currentExportBaseName(),
      },
      (value) => reportProgress("encoding", value),
    );
    finishProgress();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    setExportProgress(null);
    throw error;
  }
};
