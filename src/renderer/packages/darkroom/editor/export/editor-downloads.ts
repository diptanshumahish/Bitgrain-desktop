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
} from "../../state/transform-store";
import { isSampleSignal } from "../../state/image-store";
import { exportedThisImageSignal } from "../../state/editor-view-store";
import { triggerRasterDownload } from "../download-handlers";
import { triggerSvgDownload } from "./download-svg";
import { markEditsBaseline } from "../session/unexported-edits";
import { editorPaperColor } from "../preview/editor-colors";
import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import { shouldWatermarkExport } from "./plain-conversion/should-watermark-export";
import { isPlainConversion } from "./plain-conversion/is-plain-conversion";
import type { DownloadRasterFn } from "@bitgrain/engine/export/export-types";

interface EditorDownloads {
  downloadRaster: DownloadRasterFn;
  downloadSvg: (transparent?: boolean) => Promise<void>;
}

const markExported = (): void => {
  markEditsBaseline();
  exportedThisImageSignal.value = true;
};

const downloadRaster: DownloadRasterFn = async ({ format, scale, transparent, quality }) => {
  const grant = await resolveExportPlan({ watermarked: !isPlainConversion() });
  if (!grant) return;
  const plan = grant.plan;
  markExported();
  const delivered = await triggerRasterDownload({
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
    watermark: shouldWatermarkExport(plan),
  });
  await settleExportPack(grant, delivered ? "done" : "failed");
};

const downloadSvg = async (transparent = false): Promise<void> => {
  const grant = await resolveExportPlan();
  if (!grant) return;
  markExported();
  const delivered = await triggerSvgDownload({
    transparent, plan: grant.plan,
    bgColor: editorPaperColor(),
    isSample: isSampleSignal.value,
    modes: modesSignal.value,
    ditherMethod: ditherMethodSignal.value,
  });
  await settleExportPack(grant, delivered ? "done" : "failed");
};

export const EDITOR_DOWNLOADS: EditorDownloads = { downloadRaster, downloadSvg };
