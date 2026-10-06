import { useRef, useCallback } from "react";
import type { TemplateDef, Layer, TemplatePage } from "../../../data/studioTypes";
import { signal } from "../../../lib/signal";
import { exportStudio } from "../hooks/useStudioExport";
import { usePayment } from "../../../hooks/usePayment";
import { getPlanLimits } from "../../../config/plan-limits";
import { clampDimsToLongEdge } from "../panels/export-clamp";
import {
  exportPopupSignal,
  scaleOptSignal,
  customWSignal,
  customHSignal,
  SCALE_VALUES,
} from "../panels/export-state";

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
  anchorRef: React.RefObject<HTMLDivElement | null>;
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
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const { credits } = usePayment();
  const limits = getPlanLimits(credits.plan);
  const watermark = limits.watermark;

  const handleExport = useCallback(async () => {
    exportingSignal.value = true;
    try {
      const [baseW, baseH] = baseSize(template, pages, activePageId);
      const [rawW, rawH] = getOutputDims(baseW, baseH);
      const [outW, outH] = clampDimsToLongEdge(rawW, rawH, limits.maxExportLongEdge);
      await exportStudio(
        { ...template, width: baseW, height: baseH },
        background, layers, image, outW, outH,
        "image/png", 0.92, watermark,
      );
    } finally {
      exportingSignal.value = false;
    }
  }, [template, background, layers, image, pages, activePageId, watermark, limits.maxExportLongEdge]);

  const openExportPopup = useCallback(() => {
    if (exportPopupSignal.value !== null) {
      exportPopupSignal.value = null;
      return;
    }
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleOpt = scaleOptSignal.value;
    const [baseW, baseH] = baseSize(template, pages, activePageId);
    if (scaleOpt !== "custom") {
      customWSignal.value = baseW * SCALE_VALUES[scaleOpt];
      customHSignal.value = baseH * SCALE_VALUES[scaleOpt];
    }
    exportPopupSignal.value = {
      template, background, layers, image,
      anchorRect: rect, pages, activePageId,
    };
  }, [template, background, layers, image, pages, activePageId]);

  const openExportOptions = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const [baseW, baseH] = baseSize(template, pages, activePageId);
    customWSignal.value = baseW * SCALE_VALUES["2x"];
    customHSignal.value = baseH * SCALE_VALUES["2x"];
    exportPopupSignal.value = {
      template, background, layers, image,
      anchorRect: rect, pages, activePageId,
    };
  }, [template, background, layers, image, pages, activePageId]);

  return { anchorRef, handleExport, openExportPopup, openExportOptions };
};
