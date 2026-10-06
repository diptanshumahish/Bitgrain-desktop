import React from "react";
import { Download, Check } from "lucide-react";
import { Dropdown } from "../ui/dropdown";
import { emitPopover } from "../../../lib/event-bus";
import type { AnimationFormat, AnimationQuality } from "../../../engine/animate/export-page-animation";
import {
  useExportScale,
  useExportQuality,
  useExportFormat,
  setExportScale,
  setExportQuality,
  setExportFormat,
  useAnimationExporting,
  useAnimationExportProgress,
  useAnimationExportError,
} from "../../../store/animation-export-store";

const FORMATS: { id: AnimationFormat; label: string; hint: string }[] = [
  { id: "mp4", label: "MP4", hint: "Best quality, widely compatible" },
  { id: "webm", label: "WebM", hint: "Smaller file, for the web" },
  { id: "gif", label: "GIF", hint: "Looping image, 256 colors" },
  { id: "svg", label: "SVG", hint: "Vector, transform and opacity only" },
  { id: "lottie", label: "Lottie", hint: "Vector JSON, full motion, color and easing" },
];

const SCALE_OPTIONS = [1, 2, 3, 4].map((value) => ({ value: String(value), label: `${value}x` }));

const QUALITY_OPTIONS: { value: AnimationQuality; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "ultra", label: "Ultra" },
];

const evenify = (value: number): number => Math.max(2, Math.round(value / 2) * 2);

interface AnimationExportPanelProps {
  onExport: (format: AnimationFormat) => void;
  baseWidth: number;
  baseHeight: number;
}

export const AnimationExportPanel: React.FC<AnimationExportPanelProps> = ({
  onExport,
  baseWidth,
  baseHeight,
}) => {
  const format = useExportFormat();
  const scale = useExportScale();
  const quality = useExportQuality();
  const exporting = useAnimationExporting();
  const progress = useAnimationExportProgress();
  const error = useAnimationExportError();

  const isVector = format === "svg" || format === "lottie";
  const showQuality = format === "mp4";
  const activeFormat = FORMATS.find((entry) => entry.id === format) ?? FORMATS[0];
  const outW = evenify(baseWidth * scale);
  const outH = evenify(baseHeight * scale);

  return (
    <div className="w-[260px] bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-3 font-editorial flex flex-col gap-3">
      <div className="text-[12px] font-semibold text-[var(--s-text)]">Export animation</div>

      <div className="grid grid-cols-3 gap-1">
        {FORMATS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setExportFormat(entry.id)}
            className={`h-8 rounded-md text-[11px] font-medium transition-colors ${
              entry.id === format
                ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="text-[10.5px] text-[var(--s-text-subtle)] -mt-1.5">{activeFormat.hint}</div>

      {!isVector && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--s-text-muted)]">Resolution</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--s-text-subtle)] tabular-nums">{outW}x{outH}</span>
            <div className="w-16">
              <Dropdown
                options={SCALE_OPTIONS}
                value={String(scale)}
                onChange={(value) => setExportScale(Number(value))}
              />
            </div>
          </div>
        </div>
      )}

      {showQuality && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--s-text-muted)]">Quality</span>
          <div className="w-24">
            <Dropdown
              options={QUALITY_OPTIONS}
              value={quality}
              onChange={(value) => setExportQuality(value as AnimationQuality)}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="text-[10.5px] text-red-500 break-words">{error}</div>
      )}

      <button
        type="button"
        disabled={exporting}
        onClick={() => onExport(format)}
        className="h-9 rounded-md bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[12px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-70"
      >
        {exporting ? (
          <>Exporting {Math.round(progress * 100)}%</>
        ) : (
          <>
            <Download size={14} strokeWidth={2} /> Export {activeFormat.label}
          </>
        )}
      </button>

      {!exporting && (
        <button
          type="button"
          onClick={() => emitPopover(null)}
          className="text-[10.5px] text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)] flex items-center justify-center gap-1"
        >
          <Check size={11} strokeWidth={1.75} /> Done
        </button>
      )}
    </div>
  );
};
