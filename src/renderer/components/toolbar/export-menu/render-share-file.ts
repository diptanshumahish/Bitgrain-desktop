import { encodeRasterFile } from "../../../engine/Exporter";
import { getPlanLimits } from "../../../config/plan-limits";
import {
  reportProgress,
  finishProgress,
  setExportProgress,
  INDETERMINATE,
} from "../../../engine/export/export-progress";
import { resolveExportCanvas, resolveRenderScale } from "../../../pages/home-page/download-handlers";
import { resolvePrintFinish } from "../../../pages/home-page/export/resolve-print-finish";
import { currentExportBaseName } from "../../../pages/home-page/export/export-filename";
import type { ExportFormat } from "../../../engine/export/export-types";
import { editorPaperColor } from "../../../pages/home-page/preview/editor-colors";

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
  const encodeScale = resolved.renderedAtScale > 0 ? renderScale / resolved.renderedAtScale : renderScale;
  try {
    const { blob, filename } = await encodeRasterFile(
      resolved.canvas,
      {
        format: options.format,
        scale: encodeScale,
        transparent: options.transparent,
        bgColor: paperColor,
        watermark: getPlanLimits(options.plan).watermark,
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
