import React from "react";
import { Download } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { LOOP_FORMAT_LABELS, type LoopFormat } from "../loop-settings";
import { cancelLoopExport, loopExportErrorSignal, loopExportStatusSignal, type LoopExportStatus } from "./loop-export-store";

interface LoopExportFooterProps {
  format: LoopFormat;
  sizeHint: string;
  badge: string | null;
  canExport: boolean;
  onExport: () => void;
}

const PERCENT = 100;
const DOWNLOAD_ICON_SIZE = 13;
const PRIMARY_CLASS = "h-9 flex items-center justify-between px-3 rounded-lg text-[12px] font-semibold bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed";
const SECONDARY_CLASS = "h-9 px-3 rounded-lg text-[12px] font-medium border border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors";

const PROGRESS_CLASS = "w-full h-1 appearance-none rounded-full overflow-hidden bg-[var(--s-bg-input)] [&::-webkit-progress-bar]:bg-[var(--s-bg-input)] [&::-webkit-progress-value]:bg-[var(--s-accent)] [&::-moz-progress-bar]:bg-[var(--s-accent)]";

const statusLabel = (status: LoopExportStatus): string => {
  const percent = Math.round(status.ratio * PERCENT);
  return status.phase === "rendering" ? `Rendering frames, ${percent}%` : `Encoding, ${percent}%`;
};

export const LoopExportFooter: React.FC<LoopExportFooterProps> = ({ format, sizeHint, badge, canExport, onExport }) => {
  const status = useSignalValue(loopExportStatusSignal);
  const error = useSignalValue(loopExportErrorSignal);

  if (status) {
    return (
      <div className="flex flex-col gap-2 px-2 pt-2">
        <span aria-live="polite" className="text-[12px] text-[var(--s-text-muted)] tabular-nums">{statusLabel(status)}</span>
        <progress value={status.ratio} max={1} aria-label="Loop export progress" className={PROGRESS_CLASS} />
        <button type="button" onClick={cancelLoopExport} className={SECONDARY_CLASS}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 px-2 pt-2">
      <p className="m-0 text-[12px] text-[var(--s-text-subtle)]">{sizeHint}</p>
      {error && <p role="alert" className="m-0 text-[12px] text-red-600 dark:text-red-400">{error}</p>}
      <button type="button" onClick={onExport} disabled={!canExport} className={PRIMARY_CLASS}>
        <span className="flex items-center gap-2">
          <Download size={DOWNLOAD_ICON_SIZE} strokeWidth={2} />
          Download {LOOP_FORMAT_LABELS[format]}
        </span>
        {badge && <span className="text-[11px] font-medium opacity-80">{badge}</span>}
      </button>
    </div>
  );
};
