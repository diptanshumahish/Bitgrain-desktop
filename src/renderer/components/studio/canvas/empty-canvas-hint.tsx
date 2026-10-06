import React from "react";
import { Frame, PenLine } from "lucide-react";
import { DEFAULT_FRAME_PRESET } from "../../../utils/frame-presets";

interface EmptyCanvasHintProps {
  onAddDefaultFrame: () => void;
  onStartFrameDraw: () => void;
}

export const EmptyCanvasHint: React.FC<EmptyCanvasHintProps> = ({
  onAddDefaultFrame,
  onStartFrameDraw,
}) => (
  <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center gap-4 pointer-events-none">
    <div className="flex flex-col items-center gap-3 pointer-events-auto">
      <p className="text-sm text-[var(--s-text-subtle)]">No pages yet, add a page to start</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddDefaultFrame}
          className="flex items-center gap-2 rounded-md border border-[var(--s-border)] bg-[var(--s-surface)] px-3 py-2 text-sm text-[var(--s-text)] hover:bg-[var(--s-surface-hover)] transition-colors"
        >
          <Frame size={14} strokeWidth={1.75} />
          Add {DEFAULT_FRAME_PRESET.label}
        </button>
        <button
          type="button"
          onClick={onStartFrameDraw}
          className="flex items-center gap-2 rounded-md border border-[var(--s-border)] px-3 py-2 text-sm text-[var(--s-text-subtle)] hover:text-[var(--s-text)] transition-colors"
        >
          <PenLine size={14} strokeWidth={1.75} />
          Draw page (f)
        </button>
      </div>
    </div>
  </div>
);
