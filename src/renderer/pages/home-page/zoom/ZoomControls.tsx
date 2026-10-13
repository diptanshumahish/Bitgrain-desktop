import React from "react";
import { Minus, Plus } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { previewViewSignal, fitPreview, showActualPixels, zoomStep, actualPixelPercent } from "./preview-zoom-store";

const BUTTON_CLASS = "h-8 rounded-full text-[13px] font-medium transition-colors";
const TEXT_BUTTON_CLASS = `${BUTTON_CLASS} px-3`;
const ICON_BUTTON_CLASS = `${BUTTON_CLASS} w-8 flex items-center justify-center`;
const ACTIVE_CLASS = "bg-[var(--s-accent-soft)] text-[var(--s-accent)]";
const IDLE_CLASS = "text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)]";
const DIVIDER_CLASS = "w-px h-4 mx-1 bg-[var(--s-border)]";
const ZOOM_HINT = "Zoom with Cmd or Ctrl and scroll. When zoomed in, scroll or drag to move around.";
const ICON_SIZE = 14;

export const ZoomControls: React.FC = () => {
  const isFit = useSignalValue(previewViewSignal).fit;
  const percent = actualPixelPercent();

  return (
    <div
      role="group"
      aria-label="Preview zoom"
      title={ZOOM_HINT}
      className="hidden md:flex absolute bottom-24 right-5 z-40 items-center gap-0.5 p-1 rounded-full bg-[var(--s-bg-panel)]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 font-editorial"
    >
      <button type="button" onClick={() => zoomStep("out")} aria-label="Zoom out" className={`${ICON_BUTTON_CLASS} ${IDLE_CLASS}`}>
        <Minus size={ICON_SIZE} strokeWidth={2} />
      </button>
      <span aria-live="polite" className="min-w-[44px] text-center text-[13px] font-medium tabular-nums text-[var(--s-text)]">
        {percent === null ? "" : `${percent}%`}
      </span>
      <button type="button" onClick={() => zoomStep("in")} aria-label="Zoom in" className={`${ICON_BUTTON_CLASS} ${IDLE_CLASS}`}>
        <Plus size={ICON_SIZE} strokeWidth={2} />
      </button>
      <span aria-hidden="true" className={DIVIDER_CLASS} />
      <button type="button" onClick={fitPreview} aria-pressed={isFit} aria-label="Fit to screen" className={`${TEXT_BUTTON_CLASS} ${isFit ? ACTIVE_CLASS : IDLE_CLASS}`}>
        Fit
      </button>
      <button type="button" onClick={showActualPixels} aria-label="Zoom to 100 percent, actual pixels" className={`${TEXT_BUTTON_CLASS} ${IDLE_CLASS}`}>
        100%
      </button>
    </div>
  );
};
