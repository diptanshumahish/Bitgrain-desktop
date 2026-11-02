import React from "react";
import { Square } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { loopSettingsSignal } from "../loop-settings";
import { openLoopExport } from "../export/open-loop-export";
import { loopPreviewProgressSignal, loopPreviewSignal, stopLoopPreview } from "./loop-preview-store";

const BUTTON_CLASS = "h-8 px-3 rounded-full flex items-center gap-1.5 text-[13px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors";
const DIVIDER_CLASS = "w-px h-4 mx-1 bg-[var(--s-border)]";
const STOP_ICON_SIZE = 10;

const exportFromBar = (): void => openLoopExport("preview_bar");

export const LoopPreviewBar: React.FC = () => {
  const playing = useSignalValue(loopPreviewSignal);
  const progress = useSignalValue(loopPreviewProgressSignal);
  const fps = useSignalValue(loopSettingsSignal).fps;
  if (!playing) return null;

  return (
    <div
      role="group"
      aria-label="Loop preview"
      className="hidden md:flex absolute bottom-4 left-4 z-40 items-center gap-0.5 p-1 rounded-full bg-[var(--s-bg-panel)]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 font-editorial"
    >
      <span aria-live="polite" className="px-3 text-[13px] tabular-nums text-[var(--s-text)]">
        {progress ? `Rendering ${progress.rendered} of ${progress.total} frames` : `Looping at ${fps} fps`}
      </span>
      <span aria-hidden="true" className={DIVIDER_CLASS} />
      <button type="button" onClick={exportFromBar} className={BUTTON_CLASS}>
        Export loop
      </button>
      <button type="button" onClick={stopLoopPreview} aria-label="Stop the loop preview" className={BUTTON_CLASS}>
        <Square size={STOP_ICON_SIZE} strokeWidth={2.5} />
        Stop
      </button>
    </div>
  );
};
