import React, { useEffect, useRef } from "react";
import { Maximize2, ArrowUpRight } from "lucide-react";
import { emitModal } from "../../../lib/event-bus";
import { getPlanLimits } from "../../../config/plan-limits";
import { trackEvent } from "../../../lib/analytics";
import { exportPopupSignal } from "./export-state";

interface ExportFreeNudgeProps {
  requestedLongEdge: number;
}

const FREE_MAX_LONG_EDGE = getPlanLimits("free").maxExportLongEdge ?? 0;

export const ExportFreeNudge: React.FC<ExportFreeNudgeProps> = ({
  requestedLongEdge,
}) => {
  const isCapped =
    FREE_MAX_LONG_EDGE > 0 && requestedLongEdge > FREE_MAX_LONG_EDGE;
  const hasTrackedImpression = useRef(false);

  useEffect(() => {
    if (hasTrackedImpression.current) return;
    hasTrackedImpression.current = true;
    trackEvent("watermark_gate_shown", {
      context: "export_nudge",
      requested_long_edge: requestedLongEdge,
      is_resolution_capped: isCapped,
    });
  }, [requestedLongEdge, isCapped]);

  const handleClick = (): void => {
    trackEvent("payment_modal_opened", { trigger: "export_nudge" });
    exportPopupSignal.value = null;
    emitModal({ type: "studio-payment" });
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-between gap-2 bg-[var(--s-accent-soft)] text-[var(--s-accent)] border border-[var(--s-accent)]/30 cursor-pointer font-inherit px-2.5 py-2 w-full transition-colors hover:bg-[var(--s-accent)]/15 rounded-lg text-left"
    >
      <span className="flex items-start gap-2">
        <Maximize2 size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium leading-tight">
            {isCapped
              ? `Capping ${requestedLongEdge}px down to ${FREE_MAX_LONG_EDGE}px`
              : `Watermark on, ${FREE_MAX_LONG_EDGE}px max`}
          </span>
          <span className="text-[9px] opacity-75 leading-snug">
            {isCapped
              ? `You're losing ${requestedLongEdge - FREE_MAX_LONG_EDGE}px of detail, unlock full resolution and a clean export`
              : "Unlock full source resolution and a clean export"}
          </span>
        </span>
      </span>
      <ArrowUpRight size={14} strokeWidth={1.5} className="shrink-0" />
    </button>
  );
};
