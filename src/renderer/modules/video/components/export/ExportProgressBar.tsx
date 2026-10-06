import React from "react";
import type { ExportProgress } from "../../engine/exporter/export-types";
import { computeEtaSeconds, formatEta } from "../../engine/exporter/eta";

interface ExportProgressBarProps {
  progress: ExportProgress;
  isBusy: boolean;
}

const STATUS_GLYPH: Record<string, string> = {
  recording: "[..]",
  preparing: "[..]",
  finalizing: "[..]",
  done: "[ok]",
  error: "[!!]",
};

const STATUS_COLOR: Record<string, string> = {
  recording: "text-amber-400",
  preparing: "text-amber-400",
  finalizing: "text-amber-400",
  done: "text-emerald-400",
  error: "text-red-400",
};

function statusMessage(progress: ExportProgress): string {
  if (progress.status === "error") return progress.error || "Export Failed";
  if (progress.message) return progress.message;
  if (progress.status === "done") return "Export Successful";
  return "Rendering...";
}

export const ExportProgressBar: React.FC<ExportProgressBarProps> = ({
  progress,
  isBusy,
}) => {
  const isError = progress.status === "error";
  const glyph = STATUS_GLYPH[progress.status] ?? "[..]";
  const color = STATUS_COLOR[progress.status] ?? "text-[var(--s-text-subtle)]";
  return (
    <div className="p-4 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold text-[12px] leading-none ${color}`}>
            {glyph}
          </span>
          <span
            className={`text-[12px] font-mono font-bold ${
              isError ? "text-red-400" : "text-[var(--s-text)]"
            }`}
          >
            {statusMessage(progress)}
          </span>
        </div>
        {isBusy && (
          <span className="text-[12px] font-mono font-bold text-[var(--s-text)] tabular-nums">
            {Math.round(progress.ratio * 100)}%
          </span>
        )}
      </div>
      {isBusy && (
        <>
          <div className="h-1.5 bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden">
            <div
              className="h-full bg-[var(--s-accent)] transition-all duration-300"
              style={{ width: `${progress.ratio * 100}%` }}
            />
          </div>
          {(() => {
            const eta = computeEtaSeconds(progress.ratio, progress.startedAt);
            return (
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--s-text-subtle)]">
                <span>ETA</span>
                <span className="text-[var(--s-text)] font-bold tabular-nums">
                  {eta !== null ? formatEta(eta) : "-"}
                </span>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};
