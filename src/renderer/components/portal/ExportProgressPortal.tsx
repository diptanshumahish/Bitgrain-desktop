import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownToLine, Check } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import {
  exportProgressSignal,
  INDETERMINATE,
  type ExportProgressState,
} from "../../engine/export/export-progress";

const PERCENT = 100;
const EXIT_MS = 280;

const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

const STAR_BURST = [
  "export-star-a",
  "export-star-b",
  "export-star-c",
  "export-star-d",
  "export-star-e",
  "export-star-f",
];

export const ExportProgressPortal: React.FC = () => {
  const live = useSignalValue(exportProgressSignal);
  const [shown, setShown] = useState<ExportProgressState | null>(null);
  const [prevLive, setPrevLive] = useState<ExportProgressState | null>(live);

  if (live !== prevLive) {
    setPrevLive(live);
    if (live) setShown(live);
  }

  useEffect(() => {
    if (live || !shown) return;
    const timer = window.setTimeout(() => setShown(null), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [live, shown]);

  const state = live ?? shown;
  if (!state) return null;
  const leaving = !live;
  const isDone = state.phase === "done";
  const indeterminate = state.value === INDETERMINATE;
  const widthPercent = indeterminate ? 0 : Math.round(clamp01(state.value) * PERCENT);

  return createPortal(
    <div
      className={`fixed bottom-28 right-6 z-[10000] ${leaving ? "export-slide-out-right" : "export-slide-in-right"}`}
    >
      <div className="relative">
        {isDone && STAR_BURST.map((cls) => (
          <span
            key={cls}
            aria-hidden
            className={`absolute left-8 top-7 z-10 text-[9px] text-[var(--s-accent)] pointer-events-none select-none export-star ${cls}`}
          >
            ✦
          </span>
        ))}

        <div className="relative w-[264px] rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] px-4 py-3 font-editorial">
          <div className="flex items-center gap-3">
            <span className="relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-[var(--s-accent)] text-[var(--s-accent-text)]">
              {isDone ? (
                <>
                  <span className="absolute inset-0 rounded-full border-2 border-[var(--s-accent)] export-ring-pulse" />
                  <Check size={16} strokeWidth={2.75} className="export-pop-in" />
                </>
              ) : (
                <ArrowDownToLine size={15} strokeWidth={2.25} className="export-arrow-dip" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[var(--s-text)]">
                  {isDone ? "Saved" : "Exporting image"}
                </span>
                {!isDone && !indeterminate && (
                  <span className="text-[10px] text-[var(--s-text-subtle)] tabular-nums">
                    {widthPercent}%
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[var(--s-text-subtle)] mt-0.5 truncate">
                {isDone ? "fresh off the press" : state.label}
              </p>
            </div>
          </div>

          {!isDone && (
            <div className="mt-2.5 h-1 rounded-full bg-[var(--s-bg-input)] overflow-hidden relative">
              {indeterminate ? (
                <div className="absolute inset-y-0 left-0 w-[35%] rounded-full bg-[var(--s-accent)] export-bar-slide" />
              ) : (
                <div
                  className="h-full rounded-full bg-[var(--s-accent)] transition-[width] duration-150"
                  style={{ width: `${widthPercent}%` }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
