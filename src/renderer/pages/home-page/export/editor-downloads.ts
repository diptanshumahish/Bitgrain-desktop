import {
  modesSignal,
  lutIdSignal,
  ditherMethodSignal,
  ditherFactorSignal,
  resolutionSignal,
  contrastSignal,
  brightnessSignal,
  saturationSignal,
  grainSignal,
} from "../../../store/transform-store";
import { isSampleSignal } from "../../../store/image-store";
import { exportedThisImageSignal } from "../../../store/editor-view-store";
import { triggerRasterDownload } from "../download-handlers";
import { triggerSvgDownload } from "./download-svg";
import { markEditsBaseline } from "../session/unexported-edits";
import { editorPaperColor } from "../preview/editor-colors";
import { resolveExportPlan } from "../../../lib/plan-gate/resolve-export-plan";
import type { DownloadRasterFn } from "../../../engine/export/export-types";

const FREE_PLAN = "free";

interface EditorDownloads {
  downloadRaster: DownloadRasterFn;
  downloadSvg: (transparent?: boolean) => Promise<void>;
}

const markExported = (): void => {
  markEditsBaseline();
  exportedThisImageSignal.value = true;
};

const downloadRaster: DownloadRasterFn = async ({ format, scale, transparent, quality }) => {
  const plan = await resolveExportPlan();
  if (!plan) return;
  markExported();
  await triggerRasterDownload({
    format, scale, transparent, quality, plan,
    bgColor: editorPaperColor(),
    lutId: lutIdSignal.value,
    isSample: isSampleSignal.value,
    modes: modesSignal.value,
    resolution: resolutionSignal.value,
    contrast: contrastSignal.value,
    brightness: brightnessSignal.value,
    saturation: saturationSignal.value,
    grain: grainSignal.value,
    ditherMethod: ditherMethodSignal.value,
    ditherFactor: ditherFactorSignal.value,
    watermark: plan === FREE_PLAN,
  });
};

const downloadSvg = async (transparent = false): Promise<void> => {
  const plan = await resolveExportPlan();
  if (!plan) return;
  markExported();
  await triggerSvgDownload({
    transparent, plan,
    bgColor: editorPaperColor(),
    isSample: isSampleSignal.value,
    modes: modesSignal.value,
    ditherMethod: ditherMethodSignal.value,
  });
};

export const EDITOR_DOWNLOADS: EditorDownloads = { downloadRaster, downloadSvg };
