import React from "react";
import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround } from "lucide-react";
import type { DistributeAxis } from "@bitgrain/studio-core/layers/layer-order";

interface DistributeRowProps {
  enabled: boolean;
  onDistribute: (axis: DistributeAxis) => void;
}

const BUTTON_CLASS =
  "flex-1 h-7 flex items-center justify-center gap-1.5 rounded-md border-none bg-transparent cursor-pointer text-[12px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-panel)] hover:text-[var(--s-text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent";

export const DistributeRow: React.FC<DistributeRowProps> = ({ enabled, onDistribute }) => (
  <div
    className="flex gap-[2px] p-0.5 rounded-lg bg-[var(--s-bg-input)]"
    title={enabled ? undefined : "Select three or more layers to distribute"}
  >
    <button type="button" disabled={!enabled} onClick={() => onDistribute("horizontal")} className={BUTTON_CLASS}>
      <AlignHorizontalSpaceAround size={13} strokeWidth={1.75} />
      Horizontal
    </button>
    <button type="button" disabled={!enabled} onClick={() => onDistribute("vertical")} className={BUTTON_CLASS}>
      <AlignVerticalSpaceAround size={13} strokeWidth={1.75} />
      Vertical
    </button>
  </div>
);
