import { useCallback } from "react";
import type { TemplateDef, Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { signal } from "@bitgrain/core/signal";
import { trackEvent } from "@bitgrain/platform/tracker";
import { exportStudio } from "../hooks/useStudioExport";
import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { clampDimsToLongEdge } from "../panels/export-clamp";
import {
  exportPopupSignal,
  scaleOptSignal,
  customWSignal,
  customHSignal,
  SCALE_VALUES,
} from "../panels/export-state";
import { reportFailedExport } from "../hooks/export/notify-export-failed";
import { requireAccountToExport } from "@bitgrain/platform/guest-mode/require-account-to-export";

export const exportingSignal = signal(false);

interface UseExportHandlersArgs {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  pages: TemplatePage[];
  activePageId: string;
}

interface ExportHandlers {
  handleExport: () => Promise<void>;
  openExportPopup: () => void;
  openExportOptions: () => void;
}

const baseSize = (
  template: TemplateDef,
  pages: TemplatePage[],
  activePageId: string,
): [number, number] => {
  const page = pages.find((candidate) => candidate.id === activePageId);
  return [page?.width ?? template.width, page?.height ?? template.height];
};

const PNG_QUALITY = 0.92;

const getOutputDims = (baseW: number, baseH: number): [number, number] => {
  const scaleOpt = scaleOptSignal.value;
  if (scaleOpt === "custom") {
    return [Math.max(1, customWSignal.value), Math.max(1, customHSignal.value)];
  }
  return [baseW * SCALE_VALUES[scaleOpt], baseH * SCALE_VALUES[scaleOpt]];
};

export const useExportHandlers = ({
  template, background, layers, image, pages, activePageId,
}: UseExportHandlersArgs): ExportHandlers => {
  const handleExport = useCallback(async () => {
    if (!requireAccountToExport()) return;
    const grant = await resolveExportPlan();
    if (!grant) return;
    const limits = getPlanLimits(grant.plan);
    exportingSignal.value = true;
    try {
      const [baseW, baseH] = baseSize(template, pages, activePageId);
      const [rawW, rawH] = getOutputDims(baseW, baseH);
      const [outW, outH] = clampDimsToLongEdge(rawW, rawH, limits.maxExportLongEdge);
      await exportStudio(
        { ...template, width: baseW, height: baseH },
        background, layers, image, outW, outH,
        "image/png", PNG_QUALITY, limits.watermark,
      );
      await settleExportPack(grant, "done");
    } catch (error) {
      await reportFailedExport(error, grant);
    } finally {
      exportingSignal.value = false;
    }
  }, [template, background, layers, image, pages, activePageId]);

  const openExportPopup = useCallback(() => {
    if (exportPopupSignal.value !== null) {
      exportPopupSignal.value = null;
      return;
    }
    trackEvent("studio", "export_popup_opened", { details: { source: "export_button" } });
    const scaleOpt = scaleOptSignal.value;
    const [baseW, baseH] = baseSize(template, pages, activePageId);
    if (scaleOpt !== "custom") {
      customWSignal.value = baseW * SCALE_VALUES[scaleOpt];
      customHSignal.value = baseH * SCALE_VALUES[scaleOpt];
    }
    exportPopupSignal.value = {
      template, background, layers, image,
      pages, activePageId,
    };
  }, [template, background, layers, image, pages, activePageId]);

  const openExportOptions = useCallback(() => {
    trackEvent("studio", "export_popup_opened", { details: { source: "export_options" } });
    const [baseW, baseH] = baseSize(template, pages, activePageId);
    customWSignal.value = baseW * SCALE_VALUES["2x"];
    customHSignal.value = baseH * SCALE_VALUES["2x"];
    exportPopupSignal.value = {
      template, background, layers, image,
      pages, activePageId,
    };
  }, [template, background, layers, image, pages, activePageId]);

  return { handleExport, openExportPopup, openExportOptions };
};
