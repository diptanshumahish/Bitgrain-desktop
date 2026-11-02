import React, { useState } from "react";
import { Blend, Download } from "lucide-react";
import { trackEvent } from "../../lib/tracker";
import { ExportMoreFormats } from "./export-menu/ExportMoreFormats";
import { ExportSection } from "./export-menu/ExportSection";
import { RemoveWatermarkRow } from "./export-menu/RemoveWatermarkRow";
import { ExportShareActions } from "./export-menu/ExportShareActions";
import { shareCurrentOutput } from "./export-menu/share-output";
import { downloadBTG, createImageEditorBTG, type BTGImageEditorProject } from "../../utils/btg-export";
import { usePayment } from "../../hooks/usePayment";
import { usePlanKnown } from "../../lib/plan-gate/plan-status";
import { resolveExportPlan } from "../../lib/plan-gate/resolve-export-plan";
import { useExportSizeEstimate } from "./use-export-size-estimate";
import { ExportQualityRow } from "./export-menu/ExportQualityRow";
import { ToggleSwitch } from "./export-menu/ToggleSwitch";
import { isHdrFormat, type ExportFormat } from "../../engine/export/export-types";
import type { DownloadRasterFn } from "../../engine/export/export-types";

const UNKNOWN_PLAN_DISPLAY = "pro";

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

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "png", label: "PNG" },
  { id: "webp", label: "WebP" },
  { id: "jpeg", label: "JPEG" },
  { id: "png-hdr", label: "HDR" },
];

const SCALES = [1, 2, 4] as const;
const FULL_COLOUR_FRACTION = 1;
const DEFAULT_QUALITY = 92;
const PERCENT_DIVISOR = 100;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const ICON_SIZE = 11;
const ICON_STROKE = 1.6;
const ROW_CLASS =
  "flex items-center justify-between px-2 h-8 rounded-md text-[12px] transition-colors";
const SECONDARY_ROW_CLASS = `${ROW_CLASS} text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]`;
const DIVIDER_CLASS = "h-px bg-[var(--s-border)] mx-2 my-1 opacity-60";

const formatBytes = (bytes: number): string => {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${Math.round(bytes / BYTES_PER_KB)} KB`;
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
};

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
  const [format, setFormat] = useState<ExportFormat>("png");
  const [scale, setScale] = useState<1 | 2 | 4>(1);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [reducePalette, setReducePalette] = useState(false);
  const { credits: paymentCredits } = usePayment();
  const planKnown = usePlanKnown();
  const isFreePlan = planKnown && paymentCredits.plan === "free";

  const supportsTransparency = format !== "jpeg";
  const effectiveTransparent = transparentBg && supportsTransparency;
  const isFullColourPng = format === "png" && !reducePalette;
  const qualityFraction = isFullColourPng ? FULL_COLOUR_FRACTION : quality / PERCENT_DIVISOR;
  const isHdr = isHdrFormat(format);

  const estimate = useExportSizeEstimate({
    format,
    qualityFraction,
    scale,
    transparent: effectiveTransparent,
    enabled: true,
  });

  const handleDownloadBTG = () => {
    if (!imageData || !effectsData) return;
    const btgProject = createImageEditorBTG(imageData, effectsData);
    downloadBTG(btgProject);
    onClose();
  };

  const handleShareImage = async (): Promise<void> => {
    const plan = await resolveExportPlan();
    if (!plan) return;
    await shareCurrentOutput({
      format,
      scale,
      transparent: effectiveTransparent,
      quality: qualityFraction,
      plan,
    });
  };

  const handleDownload = () => {
    onDownloadRaster({ format, scale, transparent: effectiveTransparent, quality: qualityFraction });
    onClose();
  };

  return (
    <div className="px-1.5 py-2 flex flex-col min-w-[228px] font-editorial">
      <p className="px-2 pb-1.5 text-[12px] font-semibold text-[var(--s-text)]">Export</p>

      <div className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5 mx-2 mb-1">
        {FORMATS.map((entry) => (
          <button
            key={entry.id}
            onClick={() => {
              setFormat(entry.id);
              trackEvent("home", "export_format_selected", { details: { format: entry.id } });
            }}
            aria-pressed={format === entry.id}
            className={`flex-1 h-7 text-[12px] font-medium rounded transition-colors ${
              format === entry.id
                ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]"
                : "text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)]"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-2 h-7">
        <span className="text-[12px] text-[var(--s-text-muted)]">Size</span>
        <div className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5">
          {SCALES.map((value) => (
            <button
              key={value}
              onClick={() => {
                setScale(value);
                trackEvent("home", "export_scale_selected", { details: { scale: value } });
              }}
              aria-pressed={scale === value}
              aria-label={`Export at ${value} times size`}
              className={`w-8 h-6 text-[12px] font-medium rounded transition-colors tabular-nums ${
                scale === value
                  ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]"
                  : "text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)]"
              }`}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>

      <ExportQualityRow
        format={format}
        quality={quality}
        onQualityChange={setQuality}
        reducePalette={reducePalette}
        onToggleReducePalette={() => setReducePalette((previous) => !previous)}
      />

      <button
        type="button"
        role="switch"
        aria-checked={effectiveTransparent}
        onClick={onToggleTransparentBg}
        disabled={!supportsTransparency}
        className={`${SECONDARY_ROW_CLASS} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
      >
        <span className="flex items-center gap-2">
          <Blend size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          Transparent background
        </span>
        <ToggleSwitch on={effectiveTransparent} />
      </button>

      <div className="flex items-center justify-between px-2 h-6">
        <span className="text-[12px] text-[var(--s-text-subtle)]">Estimated file size</span>
        <span className="text-[12px] text-[var(--s-text-muted)] tabular-nums">
          {estimate.loading
            ? "Calculating..."
            : estimate.bytes !== null
              ? formatBytes(estimate.bytes)
              : "Unknown"}
        </span>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="mx-2 mt-1.5 mb-1 h-9 flex items-center justify-between px-3 rounded-lg text-[12px] font-semibold bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90 transition-opacity"
      >
        <span className="flex items-center gap-2">
          <Download size={13} strokeWidth={2} />
          Download {isHdr ? "HDR" : format.toUpperCase()}{scale > 1 ? ` at ${scale}×` : ""}
        </span>
        {isFreePlan && <span className="text-[11px] font-medium opacity-80">With watermark</span>}
      </button>

      {isFreePlan && <RemoveWatermarkRow onClose={onClose} />}

      <div className={DIVIDER_CLASS} />

      <ExportSection title="More formats">
        <ExportMoreFormats isLUT={isLUT} transparentBg={transparentBg} effectiveTransparent={effectiveTransparent} plan={planKnown ? paymentCredits.plan : UNKNOWN_PLAN_DISPLAY} onDownloadSvg={onDownloadSvg} onClose={onClose} />
      </ExportSection>

      <ExportSection title="Share and save">
        <ExportShareActions
          shareState={shareState}
          canSaveBtg={!!imageData && !!effectsData}
          onShareImage={handleShareImage}
          onSharePreset={onSharePreset}
          onDownloadBTG={handleDownloadBTG}
          onClose={onClose}
        />
      </ExportSection>
    </div>
  );
};
