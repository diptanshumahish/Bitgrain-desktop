import React from "react";
import { Minus, Plus, Maximize2, Keyboard, Film } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { OutputRatingButtons } from "../../../modules/output-rating/output-rating-buttons";
import { buildStudioRatingContext } from "../../../modules/output-rating/studio-rating-context";
import { emitModal } from "../../../lib/event-bus";
import { trackEvent } from "../../../lib/tracker";

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.1;

interface CanvasStatusBarProps {
  width: number;
  height: number;
  zoom: number;
  onZoomChange: (z: number) => void;
  onZoomFit: () => void;
  onAnimate?: () => void;
  animationActive?: boolean;
}

const openShortcutsSheet = (): void => {
  trackEvent("studio", "shortcuts_opened", { details: { source: "status_bar" } });
  emitModal({ type: "keyboard-shortcuts" });
};

const stepZoom = (current: number, direction: 1 | -1): number => {
  const next = current + direction * ZOOM_STEP;
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(next * 100) / 100));
};

export const CanvasStatusBar = ({
  width, height, zoom, onZoomChange, onZoomFit, onAnimate, animationActive,
}: CanvasStatusBarProps): React.ReactElement => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-[var(--s-bg-panel)] border-t border-[var(--s-border)] flex items-center px-3 gap-3 z-[5]">
      {onAnimate && (
        <>
          <button
            onClick={onAnimate}
            aria-label="Animate"
            className={`flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] transition-colors ${
              animationActive
                ? "bg-[var(--s-bg-input)] text-[var(--s-text)]"
                : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
            }`}
          >
            <Film size={12} strokeWidth={1.75} /> Animate
          </button>
          <div className="w-px h-3.5 bg-[var(--s-border)]" />
        </>
      )}

      <div className="flex items-center gap-2 text-[11px] text-[var(--s-text-muted)] [font-variant-numeric:tabular-nums]">
        <span>
          {width.toLocaleString()}
          <span className="text-[var(--s-text-subtle)] mx-1">×</span>
          {height.toLocaleString()}
        </span>
        <span className="text-[var(--s-text-subtle)]">px</span>
      </div>

      <div className="w-px h-3.5 bg-[var(--s-border)]" />

      <div className="text-[11px] text-[var(--s-text-subtle)]">sRGB, 8-bit</div>

      <div className="flex-1" />

      <OutputRatingButtons surface="studio" getContext={buildStudioRatingContext} />

      <div className="w-px h-3.5 bg-[var(--s-border)]" />

      <div className="flex items-center gap-0.5 bg-[var(--s-bg-input)]/60 rounded-md p-0.5">
        <Tooltip content="Zoom out">
          <button
            onClick={() => onZoomChange(stepZoom(zoom, -1))}
            aria-label="Zoom out"
            className="w-6 h-6 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:bg-[var(--s-bg-panel)] hover:text-[var(--s-text)] transition-colors active:scale-95"
          >
            <Minus size={11} strokeWidth={2} />
          </button>
        </Tooltip>
        <span className="text-[11px] text-[var(--s-text)] [font-variant-numeric:tabular-nums] min-w-[36px] text-center font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <Tooltip content="Zoom in">
          <button
            onClick={() => onZoomChange(stepZoom(zoom, 1))}
            aria-label="Zoom in"
            className="w-6 h-6 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:bg-[var(--s-bg-panel)] hover:text-[var(--s-text)] transition-colors active:scale-95"
          >
            <Plus size={11} strokeWidth={2} />
          </button>
        </Tooltip>
        <Tooltip content="Zoom to fit">
          <button
            onClick={onZoomFit}
            aria-label="Zoom to fit"
            className="w-6 h-6 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:bg-[var(--s-bg-panel)] hover:text-[var(--s-text)] transition-colors active:scale-95"
          >
            <Maximize2 size={10} strokeWidth={2} />
          </button>
        </Tooltip>
      </div>

      <Tooltip content="Keyboard shortcuts">
        <button
          type="button"
          onClick={openShortcutsSheet}
          aria-label="Keyboard shortcuts"
          className="w-6 h-6 flex items-center justify-center rounded text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text-muted)] transition-colors"
        >
          <Keyboard size={11} strokeWidth={1.75} />
        </button>
      </Tooltip>
    </div>
  );
};
