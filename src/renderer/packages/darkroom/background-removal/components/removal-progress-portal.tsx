import React from "react";
import { createPortal } from "react-dom";
import { Scissors } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { TOAST_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";
import { removalStatusSignal } from "../removal-status-store";
import { INDETERMINATE_PROGRESS, type RemovalPhase } from "../removal-types";
import { RemovalProgressBar } from "./removal-progress-bar";

const PERCENT = 100;

const PHASE_LABELS: Record<RemovalPhase, string> = {
  downloading: "downloading the cut-out model, only this once",
  preparing: "getting ready on your device",
  removing: "finding the subject",
};

export const RemovalProgressPortal: React.FC = () => {
  const status = useSignalValue(removalStatusSignal);
  if (!status) return null;
  const indeterminate = status.value === INDETERMINATE_PROGRESS;
  const percent = indeterminate ? 0 : Math.round(status.value * PERCENT);

  return createPortal(
    <div role="status" aria-live="polite" className={`fixed bottom-28 right-6 ${TOAST_LAYER} export-slide-in-right`}>
      <div className="w-[264px] rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] px-4 py-3 font-editorial">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-[var(--s-accent)] text-[var(--s-accent-text)]">
            <Scissors size={15} strokeWidth={2.25} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--s-text)]">Removing background</span>
              {!indeterminate && <span className="text-[10px] text-[var(--s-text-subtle)] tabular-nums">{percent}%</span>}
            </div>
            <p className="text-[10px] text-[var(--s-text-subtle)] mt-0.5 truncate">{PHASE_LABELS[status.phase]}</p>
          </div>
        </div>
        <RemovalProgressBar indeterminate={indeterminate} percent={percent} />
      </div>
    </div>,
    document.body,
  );
};
