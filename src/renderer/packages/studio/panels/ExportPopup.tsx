import React, { useMemo } from "react";
import { signal, useSignalValue, setSignal } from "@bitgrain/core/signal";
import { exportStudio } from "../hooks/useStudioExport";
import { exportPagesByMode, type MultiExportArgs } from "../hooks/export/export-pages";
import { saveStudioBTG } from "../topbar/save-studio-btg";
import { usePayment } from "@bitgrain/platform/billing/use-payment";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import { usePlanKnown } from "@bitgrain/platform/plans/gate/plan-status";
import { openVectorUpgradePrompt, vectorExportBlocked } from "@bitgrain/platform/plans/gate/vector-export-gate";
import { trackEvent } from "@bitgrain/platform/tracker";
import { clampDimsToLongEdge, wouldClamp } from "./export-clamp";
import { ExportFreeNudge } from "./ExportFreeNudge";
import { ExportSizeRow } from "./export-popup/ExportSizeRow";
import { SegmentedControl } from "./export-popup/SegmentedControl";
import { QualitySlider } from "./export-popup/QualitySlider";
import { PrintExportSection } from "./print-export/PrintExportSection";
import { ExportPreview } from "./export-popup/ExportPreview";
import { ExportSwitches } from "./export-popup/ExportSwitches";
import { ExportActions } from "./export-popup/ExportActions";
import { MetadataExportRow } from "@bitgrain/darkroom/metadata-cleaner/components/MetadataExportRow";
import { OptionGroup } from "./export-popup/OptionGroup";
import { promptUpgradeAfterExport } from "@bitgrain/platform/plans/gate/prompt-upgrade-after-export";
import { printModeSignal } from "./print-export/print-export-state";
import { resolvePrintPages } from "./print-export/resolve-print-pages";
import { runPrintExport } from "./print-export/run-print-export";
import { runDocumentExport } from "../hooks/export/document/run-document-export";
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
  isDocumentFormat,
  STUDIO_HDR_FORMAT,
  SCALE_VALUES,
} from "./export-state";
import type { ExportPopupData, ScaleOption, ExportFormat, ExportScope } from "./export-state";
import { reportFailedExport } from "../hooks/export/notify-export-failed";
import { FORMAT_OPTIONS, MULTI_MODE_OPTIONS, formatOptionsFor, SCALE_SEGMENTS, isSvgFormat, resolveExportScope } from "../features/svg-export/popup/export-format-options";
import { isExtendedExport, runExtendedExport } from "../features/svg-export/popup/run-extended-export";
import { exportDownloadLabel } from "../features/svg-export/popup/export-download-label";
import { SelectionScopeRow } from "../features/svg-export/popup/SelectionScopeRow";
import { SvgAdjustmentNote } from "../features/svg-export/popup/SvgAdjustmentNote";
import { resolveCurrentSelection } from "../features/svg-export/selection/selection-layers";
import { requireAccountToExport } from "@bitgrain/platform/guest-mode/require-account-to-export";

const exportingSignal = signal(false);

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
  const planKnown = usePlanKnown();
  const showFreeNudge = planKnown && limits.watermark;
  const svgLocked = planKnown && !limits.allowSvgExport;
  const isHdr = isStudioHdrFormat(format);
  const { template, background, layers, image, pages } = data;
  const activePage = pages?.find((page) => page.id === data.activePageId);
  const selection = useMemo(() => resolveCurrentSelection(), []);
  const hasMultiplePages = (pages?.length ?? 0) > 1;
  const isDocument = isDocumentFormat(format);
  const canExportSelection = selection !== null && !isDocument;
  const effectiveScope: ExportScope = resolveExportScope(scope, hasMultiplePages, canExportSelection);
  const selectionBounds = effectiveScope === "selection" ? selection?.bounds : undefined;
  const baseW = selectionBounds?.width ?? activePage?.width ?? template.width;
  const baseH = selectionBounds?.height ?? activePage?.height ?? template.height;
  const isSvg = isSvgFormat(format);
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
    if (isSvgFormat(next) && svgLocked) return openVectorUpgradePrompt("studio_svg_format");
    exportFormatSignal.value = next;
    if (isDocumentFormat(next) && hasMultiplePages) exportScopeSignal.value = "all";
  };

  const toggleHdr = (): void => {
    selectFormat(isHdr ? "image/png" : STUDIO_HDR_FORMAT);
  };

  const toggleAllPages = (): void => {
    exportScopeSignal.value = effectiveScope === "all" ? "current" : "all";
  };

  const toggleSelectionScope = (): void => {
    exportScopeSignal.value = effectiveScope === "selection" ? "current" : "selection";
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

  const handleExport = async () => {
    if (!requireAccountToExport()) return;
    if (isSvg && (await vectorExportBlocked("studio_svg_export"))) return;
    const grant = await resolveExportPlan();
    if (!grant) return;
    const exportLimits = getPlanLimits(grant.plan);
    const watermark = exportLimits.watermark;
    const maxLongEdge = exportLimits.maxExportLongEdge;
    exportingSignal.value = true;
    try {
      if (printMode) {
        const printResult = await runPrintExport({ template, pages: printPages, image, scale: getExportScale(), watermark, maxLongEdge });
        promptUpgradeAfterExport(printResult.requestedLongEdge, printResult.deliveredLongEdge, watermark);
      } else if (isDocument) {
        const documentScale = getClampedScale(maxLongEdge);
        await runDocumentExport(format, { template, pages: printPages, image, scale: documentScale, watermark });
        const documentLongEdge = Math.round(Math.max(baseW, baseH) * documentScale);
        promptUpgradeAfterExport(documentLongEdge, documentLongEdge, watermark);
      } else if (isExtendedExport(effectiveScope, format)) {
        const exportPages = effectiveScope === "all" && pages && pages.length > 0 ? pages : printPages;
        await runExtendedExport({
          scope: effectiveScope, format, quality, scale: getClampedScale(maxLongEdge), watermark,
          pages: exportPages, fallbackImage: image, selection,
        });
      } else if (effectiveScope === "all" && pages && pages.length > 0) {
        const pagesScale = getClampedScale(maxLongEdge);
        const pagesFormat = format as MultiExportArgs["format"];
        await exportPagesByMode(multiMode, { template, pages, image, scale: pagesScale, format: pagesFormat, quality, watermark });
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
      await settleExportPack(grant, "done");
    } catch (error) {
      await reportFailedExport(error, grant);
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
  const svgNoteLayers = effectiveScope === "all" && pages ? pages.flatMap((page) => page.layers) : selectionBounds && selection ? selection.layers : layers;
  const requestedLongEdge = Math.max(outW, outH);
  const isClamping = wouldClamp(outW, outH, limits.maxExportLongEdge);
  const [cappedW, cappedH] = clampDimsToLongEdge(outW, outH, limits.maxExportLongEdge);
  const formatLabel = isHdr
    ? "HDR PNG"
    : FORMAT_OPTIONS.find((option) => option.value === format)?.label || "image";
  const multiModeLabel =
    MULTI_MODE_OPTIONS.find((m) => m.value === multiMode)?.label || "ZIP";
  const downloadLabel = exportDownloadLabel({
    printMode, scope: effectiveScope, pagesAsFormat: isSvg || isDocument, pageCount: pages?.length ?? 0, formatLabel, multiModeLabel,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-5 font-editorial">
      <ExportPreview
        template={template}
        page={previewPage}
        pageCount={exportPageCount}
        printMode={printMode}
        outW={outW}
        outH={outH}
        maxLongEdge={limits.maxExportLongEdge}
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

        {canExportSelection && selection && !printMode && (
          <SelectionScopeRow layerCount={selection.layers.length} checked={effectiveScope === "selection"} onToggle={toggleSelectionScope} />
        )}

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
            aspectRatio={baseW / baseH}
          />
        </OptionGroup>

        {!printMode && !isHdr && (
          <OptionGroup label="Format">
            <SegmentedControl options={formatOptionsFor(svgLocked)} value={format} onSelect={selectFormat} tone="accent" sizing="content" />
            {(format === "image/jpeg" || format === "image/webp") && <QualitySlider quality={quality} />}
            {format === "image/png" && <QualitySlider quality={quality} label="Quality (colour reduction)" />}
            {isSvg && <SvgAdjustmentNote layers={svgNoteLayers} />}
          </OptionGroup>
        )}

        {!printMode && !isSvg && !isDocument && effectiveScope === "all" && (
          <OptionGroup label="Pages as">
            <SegmentedControl
              options={MULTI_MODE_OPTIONS}
              value={multiMode}
              onSelect={(next) => { exportMultiModeSignal.value = next; }}
              tone="solid"
            />
          </OptionGroup>
        )}

        <PrintExportSection pages={printPages} fallbackImage={image} />

        {showFreeNudge && <ExportFreeNudge requestedLongEdge={requestedLongEdge} />}

        <MetadataExportRow source="studio" onBeforeOpen={() => { exportPopupSignal.value = null; }} />

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
