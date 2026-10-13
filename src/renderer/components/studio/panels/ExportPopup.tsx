import React, { useMemo } from "react";
import { signal, useSignalValue, setSignal } from "../../../lib/signal";
import { exportStudio } from "../hooks/useStudioExport";
import { exportPagesByMode } from "../hooks/export/export-pages";
import type { MultiExportMode } from "../hooks/export/export-pages";
import { saveStudioBTG } from "../topbar/save-studio-btg";
import { usePayment } from "../../../hooks/usePayment";
import { getPlanLimits } from "../../../config/plan-limits";
import { resolveExportPlan } from "../../../lib/plan-gate/resolve-export-plan";
import { usePlanKnown } from "../../../lib/plan-gate/plan-status";
import { emitModal } from "../../../lib/event-bus";
import { trackEvent } from "../../../lib/tracker";
import { registerWatermarkedExport, shouldPromptUpgrade } from "../../../utils/upgrade-prompt";
import { clampDimsToLongEdge, wouldClamp } from "./export-clamp";
import { ExportFreeNudge } from "./ExportFreeNudge";
import { ExportSizeRow } from "./export-popup/ExportSizeRow";
import { SegmentedControl } from "./export-popup/SegmentedControl";
import { QualitySlider } from "./export-popup/QualitySlider";
import type { SegmentOption } from "./export-popup/SegmentedControl";
import { PrintExportSection } from "./print-export/PrintExportSection";
import { ExportPreview } from "./export-popup/ExportPreview";
import { ExportSwitches } from "./export-popup/ExportSwitches";
import { ExportActions } from "./export-popup/ExportActions";
import { OptionGroup } from "./export-popup/OptionGroup";
import { printModeSignal } from "./print-export/print-export-state";
import { resolvePrintPages } from "./print-export/resolve-print-pages";
import { exportPrintPdf } from "../hooks/export/print/export-print-pdf";
import {
  exportPopupSignal,
  scaleOptSignal,
  customWSignal,
  customHSignal,
  exportFormatSignal,
  exportQualitySignal,
  exportScopeSignal,
  exportMultiModeSignal,
  isStudioHdrFormat,
  STUDIO_HDR_FORMAT,
  SCALE_VALUES,
} from "./export-state";
import type {
  ExportPopupData,
  ScaleOption,
  ExportFormat,
  ExportScope,
} from "./export-state";

const exportingSignal = signal(false);
const POST_EXPORT_PROMPT_DELAY_MS = 700;

const SCALE_SEGMENTS: SegmentOption<ScaleOption>[] = (["1x", "2x", "4x", "custom"] as const).map(
  (option) => ({ label: option, value: option }),
);
const FORMAT_OPTIONS: SegmentOption<ExportFormat>[] = [
  { label: "PNG", value: "image/png" },
  { label: "JPG", value: "image/jpeg" },
  { label: "WEBP", value: "image/webp" },
];
const MULTI_MODE_OPTIONS: SegmentOption<MultiExportMode>[] = [
  { label: "ZIP", value: "zip" },
  { label: "Separate files", value: "separate" },
  { label: "Single PDF", value: "pdf" },
];

interface ExportPopupProps {
  data: ExportPopupData;
}

export const ExportPopup: React.FC<ExportPopupProps> = ({ data }) => {
  const scaleOpt = useSignalValue(scaleOptSignal);
  const customW = useSignalValue(customWSignal);
  const customH = useSignalValue(customHSignal);
  const format = useSignalValue(exportFormatSignal);
  const quality = useSignalValue(exportQualitySignal);
  const exporting = useSignalValue(exportingSignal);
  const scope = useSignalValue(exportScopeSignal);
  const multiMode = useSignalValue(exportMultiModeSignal);
  const printMode = useSignalValue(printModeSignal);
  const { credits } = usePayment();
  const limits = getPlanLimits(credits.plan);
  const showFreeNudge = usePlanKnown() && limits.watermark;
  const isHdr = isStudioHdrFormat(format);
  const { template, background, layers, image, pages } = data;
  const activePage = pages?.find((page) => page.id === data.activePageId);
  const baseW = activePage?.width ?? template.width;
  const baseH = activePage?.height ?? template.height;
  const hasMultiplePages = (pages?.length ?? 0) > 1;
  const effectiveScope: ExportScope = hasMultiplePages ? scope : "current";
  const printPages = useMemo(() => resolvePrintPages(data, effectiveScope), [data, effectiveScope]);
  const previewPage = useMemo(() => resolvePrintPages(data, "current")[0], [data]);
  const exportPageCount = effectiveScope === "all" ? (pages?.length ?? 1) : 1;

  const setScale = (opt: ScaleOption): void => {
    setSignal(scaleOptSignal, opt);
    if (opt !== "custom") {
      setSignal(customWSignal, baseW * SCALE_VALUES[opt]);
      setSignal(customHSignal, baseH * SCALE_VALUES[opt]);
    }
  };

  const selectFormat = (next: ExportFormat): void => {
    exportFormatSignal.value = next;
    if (next === STUDIO_HDR_FORMAT && exportMultiModeSignal.value === "pdf") {
      exportMultiModeSignal.value = "zip";
    }
  };

  const toggleHdr = (): void => {
    selectFormat(isHdr ? "image/png" : STUDIO_HDR_FORMAT);
  };

  const toggleAllPages = (): void => {
    exportScopeSignal.value = effectiveScope === "all" ? "current" : "all";
  };

  const togglePrintMode = (): void => {
    printModeSignal.value = !printMode;
  };

  const getOutputDims = (): [number, number] => {
    if (scaleOpt === "custom")
      return [Math.max(1, customW), Math.max(1, customH)];
    return [baseW * SCALE_VALUES[scaleOpt], baseH * SCALE_VALUES[scaleOpt]];
  };

  const getExportScale = (): number =>
    scaleOpt === "custom" ? (baseW > 0 ? getOutputDims()[0] / baseW : 1) : SCALE_VALUES[scaleOpt];

  const getClampedScale = (maxLongEdge: number | null): number => {
    const scale = getExportScale();
    const longEdge = Math.max(baseW, baseH) * scale;
    if (!maxLongEdge || longEdge <= maxLongEdge) return scale;
    return scale * (maxLongEdge / longEdge);
  };

  const promptUpgradeAfterExport = (requested: number, delivered: number, watermarked: boolean): void => {
    if (!watermarked) return;
    if (!shouldPromptUpgrade(registerWatermarkedExport())) return;
    setTimeout(() => {
      emitModal({
        type: "post-export-upgrade",
        requestedLongEdge: requested,
        deliveredLongEdge: delivered,
      });
    }, POST_EXPORT_PROMPT_DELAY_MS);
  };

  const handleExport = async () => {
    const plan = await resolveExportPlan();
    if (!plan) return;
    const exportLimits = getPlanLimits(plan);
    const watermark = exportLimits.watermark;
    const maxLongEdge = exportLimits.maxExportLongEdge;
    exportingSignal.value = true;
    try {
      if (printMode) {
        const printScale = getClampedScale(maxLongEdge);
        await exportPrintPdf({ template, pages: printPages, image, scale: printScale, watermark });
        trackEvent("studio", "export_print_pdf", {
          details: { page_count: printPages.length, watermark },
        });
        const printLongEdge = Math.round(Math.max(baseW, baseH) * printScale);
        promptUpgradeAfterExport(Math.round(Math.max(baseW, baseH) * getExportScale()), printLongEdge, watermark);
      } else if (effectiveScope === "all" && pages && pages.length > 0) {
        const pagesScale = getClampedScale(maxLongEdge);
        await exportPagesByMode(multiMode, {
          template,
          pages,
          image,
          scale: pagesScale,
          format,
          quality,
          watermark,
        });
        trackEvent("studio", "export_pages", {
          details: { mode: multiMode, page_count: pages.length, format, watermark },
        });
        const pagesLongEdge = Math.round(Math.max(baseW, baseH) * pagesScale);
        promptUpgradeAfterExport(pagesLongEdge, pagesLongEdge, watermark);
      } else {
        const [rawW, rawH] = getOutputDims();
        const [outW, outH] = clampDimsToLongEdge(rawW, rawH, maxLongEdge);
        await exportStudio(
          { ...template, width: baseW, height: baseH },
          background,
          layers,
          image,
          outW,
          outH,
          format,
          quality,
          watermark,
        );
        trackEvent("studio", "export_image", {
          details: { format, width: outW, height: outH, watermark, layer_count: layers.length },
        });
        promptUpgradeAfterExport(Math.max(rawW, rawH), Math.max(outW, outH), watermark);
      }
    } finally {
      exportingSignal.value = false;
      exportPopupSignal.value = null;
    }
  };

  const handleExportBTG = () => {
    saveStudioBTG({
      template, background, layers, image, pages, activePageId: data.activePageId,
    });
    exportPopupSignal.value = null;
  };

  const [outW, outH] = getOutputDims();
  const requestedLongEdge = Math.max(outW, outH);
  const isClamping = wouldClamp(outW, outH, limits.maxExportLongEdge);
  const [cappedW, cappedH] = clampDimsToLongEdge(outW, outH, limits.maxExportLongEdge);
  const formatLabel = isHdr
    ? "HDR PNG"
    : FORMAT_OPTIONS.find((option) => option.value === format)?.label || "image";
  const multiModeLabel =
    MULTI_MODE_OPTIONS.find((m) => m.value === multiMode)?.label || "ZIP";
  const downloadLabel = printMode
    ? "Download print PDF"
    : effectiveScope === "all" && hasMultiplePages
      ? `Download ${pages?.length ?? 0} pages, ${multiModeLabel}`
      : `Download ${formatLabel}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-5 font-editorial">
      <ExportPreview
        template={template}
        page={previewPage}
        pageCount={exportPageCount}
        printMode={printMode}
        outW={cappedW}
        outH={cappedH}
      />

      <div className="flex flex-col gap-4">
        <ExportSwitches
          pageCount={pages?.length ?? 1}
          allPages={effectiveScope === "all"}
          printMode={printMode}
          hdr={isHdr}
          onToggleAllPages={toggleAllPages}
          onTogglePrintMode={togglePrintMode}
          onToggleHdr={toggleHdr}
        />

        <OptionGroup label="Size">
          <SegmentedControl options={SCALE_SEGMENTS} value={scaleOpt} onSelect={setScale} tone="solid" />
          <ExportSizeRow
            scaleOpt={scaleOpt}
            customW={customW}
            customH={customH}
            outW={outW}
            outH={outH}
            cappedW={cappedW}
            cappedH={cappedH}
            isClamping={isClamping}
          />
        </OptionGroup>

        {!printMode && !isHdr && (
          <OptionGroup label="Format">
            <SegmentedControl options={FORMAT_OPTIONS} value={format} onSelect={selectFormat} tone="accent" />
            {/* Desktop: PNG also takes quality, as colour reduction. */}
            <QualitySlider
              quality={quality}
              label={format === "image/png" ? "Quality (colour reduction)" : "Quality"}
            />
          </OptionGroup>
        )}

        {!printMode && effectiveScope === "all" && (
          <OptionGroup label="Pages as">
            <SegmentedControl
              options={MULTI_MODE_OPTIONS.filter((option) => !(isHdr && option.value === "pdf"))}
              value={multiMode}
              onSelect={(next) => { exportMultiModeSignal.value = next; }}
              tone="solid"
            />
          </OptionGroup>
        )}

        <PrintExportSection pages={printPages} fallbackImage={image} />

        {showFreeNudge && <ExportFreeNudge requestedLongEdge={requestedLongEdge} />}

        <ExportActions
          exporting={exporting}
          downloadLabel={downloadLabel}
          onSaveBtg={handleExportBTG}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};
