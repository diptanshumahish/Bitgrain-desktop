import React from "react";
import { Minus, Plus, Maximize2, Keyboard } from "lucide-react";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { emitStudioModal } from "../modals/studio-dialog/host/studio-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { RollingNumber } from "@bitgrain/ui/motion/rolling-number/RollingNumber";

interface CanvasStatusBarProps {
  width: number;
  height: number;
  zoom: number;
  onZoomStep: (direction: 1 | -1) => void;
  onZoomFit: () => void;
}

const ZOOM_PERCENT = 100;

const ZOOM_BUTTON_CLASS =
  "w-6 h-6 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:bg-[var(--s-bg-panel)] hover:text-[var(--s-text)] transition-colors active:scale-95";

const openShortcutsSheet = (): void => {
  trackEvent("studio", "shortcuts_opened", { details: { source: "status_bar" } });
  emitStudioModal({ type: "keyboard-shortcuts" });
};

export const CanvasStatusBar = ({
  width, height, zoom, onZoomStep, onZoomFit,
}: CanvasStatusBarProps): React.ReactElement => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-[var(--s-bg-panel)] border-t border-[var(--s-border)] flex items-center px-3 gap-3 z-[5]">
      <div className="flex items-center gap-1 text-[12px] text-[var(--s-text-muted)] [font-variant-numeric:tabular-nums]">
        {width.toLocaleString()}
        <span>×</span>
        {height.toLocaleString()}
        <span>px</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 bg-[var(--s-bg-input)]/60 rounded-md p-0.5">
        <Tooltip content="Zoom out">
          <button onClick={() => onZoomStep(-1)} aria-label="Zoom out" className={ZOOM_BUTTON_CLASS}>
            <Minus size={13} strokeWidth={2} />
          </button>
        </Tooltip>
        <RollingNumber value={zoom * ZOOM_PERCENT} suffix="%" className="text-[12px] text-[var(--s-text)] min-w-[40px] font-medium" />
        <Tooltip content="Zoom in">
          <button onClick={() => onZoomStep(1)} aria-label="Zoom in" className={ZOOM_BUTTON_CLASS}>
            <Plus size={13} strokeWidth={2} />
          </button>
        </Tooltip>
        <Tooltip content="Zoom to fit">
          <button onClick={onZoomFit} aria-label="Zoom to fit" className={ZOOM_BUTTON_CLASS}>
            <Maximize2 size={12} strokeWidth={2} />
          </button>
        </Tooltip>
      </div>

      <Tooltip content="Keyboard shortcuts">
        <button
          type="button"
          onClick={openShortcutsSheet}
          aria-label="Keyboard shortcuts"
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
        >
          <Keyboard size={13} strokeWidth={1.75} />
        </button>
      </Tooltip>
    </div>
  );
};
