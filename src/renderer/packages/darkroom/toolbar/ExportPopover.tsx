import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { ExportTabs } from "./export-menu/ExportTabs";
import { ExportImageSettings } from "./export-menu/ExportImageSettings";
import { ExportMoreFormats } from "./export-menu/ExportMoreFormats";
import { ExportShareActions } from "./export-menu/share/ExportShareActions";
import { ExportDownloadFooter } from "./export-menu/download/ExportDownloadFooter";
import { estimateLabel } from "./export-menu/download/format-bytes";
import { shareCurrentOutput } from "./export-menu/share/share-output";
import { exportSettingsSignal } from "./export-menu/export-settings-store";
import { useExportPlan } from "./export-menu/use-export-plan";
import type { BTGImageEditorProject } from "@bitgrain/studio-core/io/btg-export";
import { saveEditorProject } from "../editor/project/save-editor-project";
import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import { isPlainConversion } from "../editor/export/plain-conversion/is-plain-conversion";
import { useExportSizeEstimate } from "./use-export-size-estimate";
import type { DownloadRasterFn, ExportFormat } from "@bitgrain/engine/export/export-types";

interface ExportPopoverProps {
  transparentBg: boolean;
  onToggleTransparentBg: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent: boolean) => void;
  onSharePreset: () => void;
  shareState: "idle" | "copied";
  isLUT?: boolean;
  imageData?: string;
  effectsData?: BTGImageEditorProject["effects"];
  onClose: () => void;
}

const FORMAT_NAMES: Record<ExportFormat, string> = { png: "PNG", webp: "WebP", jpeg: "JPEG", "png-hdr": "HDR PNG" };
const FULL_COLOUR_FRACTION = 1;
const PERCENT_DIVISOR = 100;

export const ExportPopover: React.FC<ExportPopoverProps> = ({
  transparentBg,
  onToggleTransparentBg,
  onDownloadRaster,
  onDownloadSvg,
  onSharePreset,
  shareState,
  isLUT = false,
  imageData,
  effectsData,
  onClose,
}) => {
  const settings = useSignalValue(exportSettingsSignal);
  const { format, scale, quality, reducePalette, tab } = settings;
  const plan = useExportPlan();
  const effectiveTransparent = transparentBg && format !== "jpeg";
  const qualityFraction = format === "png" && !reducePalette ? FULL_COLOUR_FRACTION : quality / PERCENT_DIVISOR;
  const estimate = useExportSizeEstimate({ format, qualityFraction, scale, transparent: effectiveTransparent, enabled: tab === "image", plan: plan.exportPlan });
  const rasterOptions = { format, scale, transparent: effectiveTransparent, quality: qualityFraction };

  const closeAll = (): void => {
    emitPopover(null);
    onClose();
  };

  const handleDownloadBTG = (): void => {
    if (!imageData || !effectsData) return;
    void saveEditorProject(effectsData);
    closeAll();
  };

  const handleShareImage = async (): Promise<void> => {
    const grant = await resolveExportPlan({ watermarked: !isPlainConversion() });
    if (!grant) return;
    const outcome = await shareCurrentOutput({ ...rasterOptions, plan: grant.plan });
    await settleExportPack(grant, outcome);
  };

  const handleDownload = (): void => {
    onDownloadRaster(rasterOptions);
    onClose();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-editorial">
      <ExportTabs tab={tab} />
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-4">
        {tab === "image" && <ExportImageSettings settings={settings} transparent={transparentBg} onToggleTransparent={onToggleTransparentBg} />}
        {tab === "formats" && (
          <ExportMoreFormats isLUT={isLUT} transparentBg={transparentBg} effectiveTransparent={effectiveTransparent} plan={plan.displayPlan} showsWatermark={plan.showsWatermark} onDownloadSvg={onDownloadSvg} onClose={closeAll} />
        )}
        {tab === "share" && (
          <ExportShareActions shareState={shareState} canSaveBtg={!!imageData && !!effectsData} onShareImage={handleShareImage} onSharePreset={onSharePreset} onDownloadBTG={handleDownloadBTG} onClose={closeAll} />
        )}
      </div>
      {tab === "image" && (
        <ExportDownloadFooter
          label={`Download ${FORMAT_NAMES[format]}${scale > 1 ? ` at ${scale}×` : ""}`}
          sizeLabel={estimateLabel(estimate.bytes, estimate.loading)}
          scale={scale}
          showsWatermark={plan.showsWatermark}
          packNote={plan.packNote}
          onDownload={handleDownload}
          onClose={closeAll}
        />
      )}
    </div>
  );
};
