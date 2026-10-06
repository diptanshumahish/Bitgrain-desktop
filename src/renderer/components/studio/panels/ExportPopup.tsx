import React from "react";
import { Download, Loader, Save } from "lucide-react";
import { signal, useSignalValue, setSignal } from "../../../lib/signal";
import { exportStudio } from "../hooks/useStudioExport";
import { exportPagesByMode } from "../hooks/export/export-pages";
import type { MultiExportMode } from "../hooks/export/export-pages";
import { saveStudioBTG } from "../topbar/save-studio-btg";
import { usePayment } from "../../../hooks/usePayment";
import { getPlanLimits } from "../../../config/plan-limits";
import { emitModal } from "../../../lib/event-bus";
import { trackEvent } from "../../../lib/tracker";
import { registerWatermarkedExport, shouldPromptUpgrade } from "../../../utils/upgrade-prompt";
import { clampDimsToLongEdge, wouldClamp } from "./export-clamp";
import { ExportFreeNudge } from "./ExportFreeNudge";
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

const SCALE_OPTIONS: ScaleOption[] = ["1x", "2x", "4x", "custom"];
const FORMAT_OPTIONS: { label: string; value: ExportFormat }[] = [
  { label: "PNG", value: "image/png" },
  { label: "JPG", value: "image/jpeg" },
  { label: "WEBP", value: "image/webp" },
  { label: "HDR", value: "image/hdr-png" },
];
const SCOPE_OPTIONS: { label: string; value: ExportScope }[] = [
  { label: "Current page", value: "current" },
  { label: "All pages", value: "all" },
];
const MULTI_MODE_OPTIONS: { label: string; value: MultiExportMode }[] = [
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
  const { credits } = usePayment();
  const limits = getPlanLimits(credits.plan);
  const watermark = limits.watermark;
  const isHdr = isStudioHdrFormat(format);
  const { template, background, layers, image, pages } = data;
  const activePage = pages?.find((page) => page.id === data.activePageId);
  const baseW = activePage?.width ?? template.width;
  const baseH = activePage?.height ?? template.height;
  const hasMultiplePages = (pages?.length ?? 0) > 1;
  const effectiveScope: ExportScope = hasMultiplePages ? scope : "current";

  const setScale = (opt: ScaleOption): void => {
    setSignal(scaleOptSignal, opt);
    if (opt !== "custom") {
      setSignal(customWSignal, baseW * SCALE_VALUES[opt]);
      setSignal(customHSignal, baseH * SCALE_VALUES[opt]);
    }
  };

  const getOutputDims = (): [number, number] => {
    if (scaleOpt === "custom")
      return [Math.max(1, customW), Math.max(1, customH)];
    return [baseW * SCALE_VALUES[scaleOpt], baseH * SCALE_VALUES[scaleOpt]];
  };

  const getExportScale = (): number =>
    scaleOpt === "custom" ? (baseW > 0 ? getOutputDims()[0] / baseW : 1) : SCALE_VALUES[scaleOpt];

  const promptUpgradeAfterExport = (requested: number, delivered: number): void => {
    if (!watermark) return;
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
    exportingSignal.value = true;
    try {
      if (effectiveScope === "all" && pages && pages.length > 0) {
        let pagesScale = getExportScale();
        if (limits.maxExportLongEdge) {
          const longEdge = Math.max(baseW, baseH) * pagesScale;
          if (longEdge > limits.maxExportLongEdge) {
            pagesScale *= limits.maxExportLongEdge / longEdge;
          }
        }
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
        promptUpgradeAfterExport(pagesLongEdge, pagesLongEdge);
      } else {
        const [rawW, rawH] = getOutputDims();
        const [outW, outH] = clampDimsToLongEdge(rawW, rawH, limits.maxExportLongEdge);
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
        promptUpgradeAfterExport(Math.max(rawW, rawH), Math.max(outW, outH));
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
  const formatLabel =
    FORMAT_OPTIONS.find((f) => f.value === format)?.label || "IMAGE";
  const multiModeLabel =
    MULTI_MODE_OPTIONS.find((m) => m.value === multiMode)?.label || "ZIP";
  const downloadLabel =
    effectiveScope === "all" && hasMultiplePages
      ? `Download ${pages?.length ?? 0} pages, ${multiModeLabel}`
      : `Download ${formatLabel}`;

  return (
    <div className="flex flex-col gap-2.5 font-editorial">
      <span className="  text-[8.5px] text-[var(--s-text-subtle)]    ">
        Export options
      </span>

      <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
        {SCALE_OPTIONS.map((opt, i) => (
          <button
            key={opt}
            onClick={() => setScale(opt)}
            className={`flex-1 py-1 border-none cursor-pointer text-[10.5px] font-semibold font-inherit transition-colors ${
              i < SCALE_OPTIONS.length - 1
                ? "border-r border-[var(--s-border)]"
                : ""
            } ${scaleOpt === opt ? "bg-[var(--s-text)] text-[var(--s-bg-panel)]" : "bg-transparent text-[var(--s-text-muted)]"}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {scaleOpt === "custom" ? (
        <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
          {(
            [
              ["W", customW, customWSignal],
              ["H", customH, customHSignal],
            ] as const
          ).map(([lbl, val, sig], i) => (
            <div
              key={lbl}
              className={`flex-1 flex items-center px-2 h-8 gap-1.5 ${i === 0 ? "border-r border-[var(--s-border)]" : ""}`}
            >
              <span className="  text-[8.5px] text-[var(--s-text-subtle)]">
                {lbl}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={val}
                onChange={(e) => {
                  sig.value = Math.max(1, parseInt(e.target.value) || 1);
                }}
                className="flex-1 bg-transparent border-none text-[11px] text-[var(--s-text)] outline-none   w-0"
              />
              <span className="  text-[8.5px] text-[var(--s-text-subtle)]">
                px
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between border border-[var(--s-border)] px-2.5 py-1 rounded-lg">
          {isClamping ? (
            <>
              <span className="text-[10.5px] text-[var(--s-text-muted)] line-through">
                {outW} × {outH} px
              </span>
              <span className="text-[10.5px] font-medium text-[var(--s-accent)]">
                exporting {cappedW} × {cappedH} px
              </span>
            </>
          ) : (
            <span className="text-[10.5px] text-[var(--s-text-muted)]">
              {outW} × {outH} px
            </span>
          )}
        </div>
      )}

      <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
        {FORMAT_OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => {
              exportFormatSignal.value = opt.value;
              if (opt.value === "image/hdr-png" && exportMultiModeSignal.value === "pdf") {
                exportMultiModeSignal.value = "zip";
              }
            }}
            className={`flex-1 py-1 border-none cursor-pointer text-[10.5px] font-semibold font-inherit transition-colors ${
              i < FORMAT_OPTIONS.length - 1
                ? "border-r border-[var(--s-border)]"
                : ""
            } ${format === opt.value ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "bg-transparent text-[var(--s-text-muted)]"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isHdr && (
        <div className="px-1 text-[9px] leading-snug text-[var(--s-text-subtle)]">
          BT.2100 PQ at 800 nits, view on HDR display in Chrome or Safari
        </div>
      )}

      {!isHdr && (
        <div className="flex flex-col gap-1.5 px-1">
          <div className="flex justify-between items-baseline">
            <span className="  text-[8.5px] text-[var(--s-text-subtle)]    ">
              {format === "image/png" ? "Quality (colour reduction)" : "Quality"}
            </span>
            <span className="  text-[9px] text-[var(--s-text-muted)]">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.01}
            value={quality}
            onChange={(e) => {
              exportQualitySignal.value = parseFloat(e.target.value);
            }}
            className="w-full accent-[var(--s-accent)]"
          />
        </div>
      )}

      {hasMultiplePages && (
        <>
          <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
            {SCOPE_OPTIONS.map((opt, i) => (
              <button
                key={opt.value}
                onClick={() => {
                  exportScopeSignal.value = opt.value;
                }}
                className={`flex-1 py-1 border-none cursor-pointer text-[10.5px] font-semibold font-inherit transition-colors ${
                  i < SCOPE_OPTIONS.length - 1
                    ? "border-r border-[var(--s-border)]"
                    : ""
                } ${scope === opt.value ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "bg-transparent text-[var(--s-text-muted)]"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {effectiveScope === "all" && (
            <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
              {MULTI_MODE_OPTIONS.filter((opt) => !(isHdr && opt.value === "pdf")).map((opt, i, arr) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    exportMultiModeSignal.value = opt.value;
                  }}
                  className={`flex-1 py-1 border-none cursor-pointer text-[10.5px] font-semibold font-inherit transition-colors ${
                    i < arr.length - 1
                      ? "border-r border-[var(--s-border)]"
                      : ""
                  } ${multiMode === opt.value ? "bg-[var(--s-text)] text-[var(--s-bg-panel)]" : "bg-transparent text-[var(--s-text-muted)]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <div className="h-px bg-[var(--s-border)] mt-1" />

      {watermark && <ExportFreeNudge requestedLongEdge={requestedLongEdge} />}

      <button
        onClick={handleExportBTG}
        className="flex items-center justify-center gap-1.5 bg-[var(--s-bg-input)] text-[var(--s-text)] border-none cursor-pointer text-[12px] font-medium font-inherit py-1.5 w-full transition-all hover:bg-[var(--s-bg-input-hover)] rounded-lg"
      >
        <Save size={11} strokeWidth={1.5} />
        Save as .BTG
      </button>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center justify-center gap-1.5 bg-[var(--s-text)] text-[var(--s-bg-panel)] border-none cursor-pointer text-[12px] font-medium font-inherit py-1.5 w-full disabled:opacity-65 transition-all hover:brightness-110 rounded-lg"
      >
        {exporting ? (
          <Loader size={11} className="animate-spin" />
        ) : (
          <Download size={11} strokeWidth={1.5} />
        )}
        {downloadLabel}
      </button>
    </div>
  );
};
