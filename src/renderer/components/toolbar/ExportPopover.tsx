import React, { useState } from "react";
import { Blend, Link, Aperture, Save, EyeOff, Download, Layers, Film } from "lucide-react";
import { emitModal } from "../../lib/event-bus";
import { publishCurrentLook } from "../../pages/recipes-page/publish-recipe";
import { triggerPlatformDownload } from "../../pages/home-page/download-handlers";
import { PLATFORM_PRESETS } from "./platform-presets";
import { downloadBTG, createImageEditorBTG } from "../../utils/btg-export";
import { formatCredit } from "../../lib/format-credit";
import { usePayment } from "../../hooks/usePayment";
import { Slider } from "./slider";
import { useExportSizeEstimate } from "./use-export-size-estimate";
import { qualityToColorCount, isFullColorQuality, isHdrFormat, type ExportFormat } from "../../engine/export/export-types";
import type { DownloadRasterFn } from "../../engine/export/export-types";

interface ExportPopoverProps {
  credits: { png: number; svg: number };
  transparentBg: boolean;
  onToggleTransparentBg: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent: boolean) => void;
  onSharePreset: () => void;
  shareState: "idle" | "copied";
  isLUT?: boolean;
  imageData?: string;
  effectsData?: {
    modes: string[];
    lutId: string | null;
    ditherMethod: string;
    ditherFactor: number;
    resolution: number;
    contrast: number;
    brightness: number;
    saturation: number;
    grain: number;
    hue: number;
    isColor: boolean;
    palette: { id: string; colors: string[] } | null;
    hazeIntensity: number;
    bloomIntensity: number;
    bloomThreshold: number;
    hazeWarmth: string;
  };
  onClose: () => void;
}

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "png", label: "PNG" },
  { id: "webp", label: "WebP" },
  { id: "jpeg", label: "JPEG" },
  { id: "png-hdr", label: "HDR" },
];

const SCALES = [1, 2, 4] as const;
const QUALITY_MIN = 1;
const QUALITY_MAX = 100;
const QUALITY_STEP = 1;
const DEFAULT_QUALITY = 92;
const PERCENT_DIVISOR = 100;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const ICON_SIZE = 11;
const ICON_STROKE = 1.6;
const ROW_CLASS =
  "flex items-center justify-between px-2 h-7 rounded-md text-[11px] transition-colors";
const SECONDARY_ROW_CLASS = `${ROW_CLASS} text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]`;
const COUNT_CHIP_CLASS = "text-[10px] font-medium text-[var(--s-text-subtle)] tabular-nums";
const DIVIDER_CLASS = "h-px bg-[var(--s-border)] mx-2 my-1 opacity-60";

const formatBytes = (bytes: number): string => {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${Math.round(bytes / BYTES_PER_KB)} KB`;
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
};

export const ExportPopover: React.FC<ExportPopoverProps> = ({
  credits,
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
  const { credits: paymentCredits } = usePayment();
  const isFreePlan = paymentCredits.plan === "free";

  const supportsTransparency = format !== "jpeg";
  const effectiveTransparent = transparentBg && supportsTransparency;
  const qualityFraction = quality / PERCENT_DIVISOR;
  const isHdr = isHdrFormat(format);

  const estimate = useExportSizeEstimate({
    format,
    qualityFraction,
    scale,
    transparent: effectiveTransparent,
    enabled: true,
  });

  const pngHint = isFullColorQuality(qualityFraction)
    ? "full color"
    : `${qualityToColorCount(qualityFraction)} colors`;
  const qualityHint = format === "png" ? pngHint : `${quality}%`;

  const handleDownloadBTG = () => {
    if (!imageData || !effectsData) return;
    const btgProject = createImageEditorBTG(imageData, effectsData);
    downloadBTG(btgProject);
    onClose();
  };

  const handleDownload = () => {
    onDownloadRaster({ format, scale, transparent: effectiveTransparent, quality: qualityFraction });
    onClose();
  };

  return (
    <div className="px-1.5 py-2 flex flex-col min-w-[228px] font-editorial">
      <p className="px-2 pb-1 text-[9.5px] font-medium text-[var(--s-text-subtle)]">export</p>

      <div className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5 mx-2 mb-1">
        {FORMATS.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setFormat(entry.id)}
            className={`flex-1 h-6 text-[10px] font-medium rounded transition-colors ${
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
        <span className="text-[11px] text-[var(--s-text-muted)]">scale</span>
        <div className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5">
          {SCALES.map((value) => (
            <button
              key={value}
              onClick={() => setScale(value)}
              className={`w-7 h-5 text-[10px] font-medium rounded transition-colors tabular-nums ${
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

      {isHdr ? (
        <div className="px-2 h-7 flex items-center text-[10px] text-[var(--s-text-subtle)] leading-snug">
          BT.2100 PQ at 800 nits, view on HDR display in Chrome or Safari
        </div>
      ) : (
        <div className="grid grid-cols-[auto_1fr_56px] items-center gap-2.5 px-2 h-7">
          <span className="text-[11px] text-[var(--s-text-muted)]">
            {format === "png" ? "colors" : "quality"}
          </span>
          <Slider
            min={QUALITY_MIN}
            max={QUALITY_MAX}
            step={QUALITY_STEP}
            value={quality}
            onChange={setQuality}
          />
          <span className="text-[10px] text-[var(--s-text-subtle)] tabular-nums text-right">
            {qualityHint}
          </span>
        </div>
      )}

      <button
        onClick={onToggleTransparentBg}
        disabled={!supportsTransparency}
        className={`${SECONDARY_ROW_CLASS} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
      >
        <span className="flex items-center gap-2">
          <Blend size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          transparent background
        </span>
        <span
          className={`w-6 h-3 rounded-full transition-colors flex items-center px-0.5 ${effectiveTransparent ? "bg-[var(--s-accent)]" : "bg-[var(--s-border)]"}`}
        >
          <span
            className={`w-2 h-2 rounded-full bg-white transition-transform ${effectiveTransparent ? "translate-x-3" : "translate-x-0"}`}
          />
        </span>
      </button>

      <div className="flex items-center justify-between px-2 h-6">
        <span className="text-[10px] text-[var(--s-text-subtle)]">estimated size</span>
        <span className="text-[10px] text-[var(--s-text-muted)] tabular-nums">
          {estimate.loading
            ? "calculating…"
            : estimate.bytes !== null
              ? `~${formatBytes(estimate.bytes)}`
              : "—"}
        </span>
      </div>

      <div className={DIVIDER_CLASS} />

      <button
        onClick={handleDownload}
        className={`${ROW_CLASS} font-medium text-[var(--s-text)] bg-[var(--s-bg-input-hover)] hover:bg-[var(--s-accent-soft)]`}
      >
        <span className="flex items-center gap-2">
          <Download size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          download {isHdr ? "HDR" : format.toUpperCase()}{scale > 1 ? ` · ${scale}×` : ""}
        </span>
        <span className={COUNT_CHIP_CLASS}>{formatCredit(credits.png)}</span>
      </button>

      {!isLUT && (
        <button
          onClick={() => {
            onDownloadSvg(transparentBg);
            onClose();
          }}
          className={`${ROW_CLASS} font-medium text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)]`}
        >
          <span>vector SVG</span>
          <span className={COUNT_CHIP_CLASS}>{formatCredit(credits.svg)}</span>
        </button>
      )}

      <button
        onClick={() => {
          emitModal({ type: "riso-export" });
          onClose();
        }}
        className={`${ROW_CLASS} font-medium text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)]`}
      >
        <span className="flex items-center gap-2">
          <Layers size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          riso separation
        </span>
        <span className={COUNT_CHIP_CLASS}>zip</span>
      </button>

      <button
        onClick={() => {
          emitModal({ type: "animate" });
          onClose();
        }}
        className={`${ROW_CLASS} font-medium text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)]`}
      >
        <span className="flex items-center gap-2">
          <Film size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          animate
        </span>
        <span className={COUNT_CHIP_CLASS}>mp4</span>
      </button>

      <div className={DIVIDER_CLASS} />

      <div className="px-2 pt-1 pb-1.5">
        <p className="text-[9px] text-[var(--s-text-subtle)] mb-1.5">platform sizes</p>
        <div className="grid grid-cols-2 gap-1">
          {PLATFORM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                triggerPlatformDownload({
                  presetId: preset.id,
                  format: preset.format,
                  targetWidth: preset.width,
                  targetHeight: preset.height,
                  transparent: effectiveTransparent,
                  plan: paymentCredits.plan,
                });
                onClose();
              }}
              className="flex flex-col items-start px-2 py-1.5 rounded-md text-left hover:bg-[var(--s-bg-input-hover)] transition-colors"
            >
              <span className="text-[11px] text-[var(--s-text)]">{preset.label}</span>
              <span className="text-[9px] text-[var(--s-text-subtle)]">{preset.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={DIVIDER_CLASS} />

      <button
        onClick={() => {
          onSharePreset();
          onClose();
        }}
        className={`flex items-center gap-2 px-2 h-7 rounded-md text-[11px] transition-colors ${
          shareState === "copied"
            ? "text-[var(--s-accent)]"
            : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
        }`}
      >
        <Link size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        {shareState === "copied" ? "link copied" : "copy recipe link"}
      </button>

      <button
        onClick={() => {
          publishCurrentLook();
          onClose();
        }}
        className="flex items-center gap-2 px-2 h-7 rounded-md text-[11px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors"
      >
        <Layers size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        publish to community
      </button>

      <button
        onClick={handleDownloadBTG}
        disabled={!imageData || !effectsData}
        className="flex items-center gap-2 px-2 h-7 rounded-md text-[11px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <Save size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        save as .BTG
      </button>

      <button
        onClick={() => {
          window.location.href = "/templates";
          onClose();
        }}
        className="flex items-center gap-2 px-2 h-7 rounded-md text-[11px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors"
      >
        <Aperture size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        browse studio templates
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--s-accent)]" />
      </button>

      {isFreePlan && (
        <>
          <div className={DIVIDER_CLASS} />
          <button
            onClick={() => {
              emitModal({ type: "studio-payment" });
              onClose();
            }}
            className="group flex items-center gap-2 px-2 h-7 rounded-md text-[11px] text-[var(--s-text-muted)] hover:bg-[var(--s-accent-soft)] hover:text-[var(--s-accent)] transition-colors"
          >
            <EyeOff size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-[var(--s-accent)]" />
            remove watermark
            <span className="ml-auto text-[10px] text-[var(--s-text-subtle)] group-hover:text-[var(--s-accent)]">
              Pro
            </span>
          </button>
        </>
      )}
    </div>
  );
};
