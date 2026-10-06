import React from "react";
import { useSignalValue } from "../../../../lib/signal";
import {
  exportPanelOpenSignal,
  exportProgressSignal,
  resetExportProgress,
} from "../../engine/exporter/export-types";
import { computeEtaSeconds, formatEta } from "../../engine/exporter/eta";
import { trackEvent } from "../../../../lib/tracker";

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

function statusMessage(status: string, message?: string | null, error?: string | null): string {
  if (status === "error") return error || "Export failed";
  if (status === "done") return "Export complete";
  return message || "Rendering...";
}

export const ExportToast: React.FC = () => {
  const open = useSignalValue(exportPanelOpenSignal);
  const progress = useSignalValue(exportProgressSignal);

  if (open) return null;

  const isBusy =
    progress.status === "preparing" ||
    progress.status === "recording" ||
    progress.status === "finalizing";
  const isTerminal = progress.status === "done" || progress.status === "error";

  if (!isBusy && !isTerminal) return null;

  const glyph = STATUS_GLYPH[progress.status] ?? "[..]";
  const color = STATUS_COLOR[progress.status] ?? "text-[var(--s-text-subtle)]";
  const ratioPct = Math.round(progress.ratio * 100);

  const reopen = (): void => {
    exportPanelOpenSignal.value = true;
  };

  const dismiss = (event: React.MouseEvent): void => {
    event.stopPropagation();
    resetExportProgress();
  };

  const download = (event: React.MouseEvent): void => {
    event.stopPropagation();
    if (!progress.downloadUrl) return;
    trackEvent("video", "export_downloaded", {
      details: { name: progress.fileName },
    });
    const anchor = document.createElement("a");
    anchor.href = progress.downloadUrl;
    anchor.download = progress.fileName ?? "export";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <button
      type="button"
      onClick={reopen}
      className="fixed bottom-4 right-4 z-[90] w-[300px] bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-md px-3 py-2.5 flex flex-col gap-2 text-left hover:border-[var(--s-accent)] transition-colors"
      aria-label="Open export panel"
    >
      <div className="flex items-center gap-2">
        <span className={`font-mono font-bold text-[12px] leading-none ${color}`}>
          {glyph}
        </span>
        <span className="flex-1 text-[11px] font-mono font-bold  text-[var(--s-text)] truncate">
          {statusMessage(progress.status, progress.message, progress.error)}
        </span>
        {isBusy && (
          <span className="text-[11px] font-mono font-bold tabular-nums text-[var(--s-text)]">
            {ratioPct}%
          </span>
        )}
      </div>
      {isBusy && (
        <>
          <div className="h-1 bg-[var(--s-bg-input)] overflow-hidden">
            <div
              className="h-full bg-[var(--s-accent)] transition-all duration-300"
              style={{ width: `${ratioPct}%` }}
            />
          </div>
          {(() => {
            const eta = computeEtaSeconds(progress.ratio, progress.startedAt);
            return (
              <div className="flex items-center justify-between text-[9px] font-mono text-[var(--s-text-subtle)]">
                <span>ETA</span>
                <span className="text-[var(--s-text)] font-bold tabular-nums">
                  {eta !== null ? formatEta(eta) : "-"}
                </span>
              </div>
            );
          })()}
        </>
      )}
      {isTerminal && (
        <div className="flex items-center gap-1.5">
          {progress.status === "done" && progress.downloadUrl && (
            <span
              role="button"
              tabIndex={0}
              onClick={download}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  download(event as unknown as React.MouseEvent);
                }
              }}
              className="px-2 py-1 rounded-sm bg-[var(--s-text)] text-[var(--s-bg-panel)] text-[10px] font-mono font-bold hover:opacity-90"
            >
              [v] Download
            </span>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={dismiss}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                dismiss(event as unknown as React.MouseEvent);
              }
            }}
            className="px-2 py-1 rounded-sm border border-[var(--s-border)] text-[10px] font-mono font-bold text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
          >
            Dismiss
          </span>
        </div>
      )}
    </button>
  );
};
