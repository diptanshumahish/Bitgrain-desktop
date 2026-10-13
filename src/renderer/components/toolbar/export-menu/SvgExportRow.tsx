import React from "react";
import { Lock, PenTool } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { modesSignal, lutIdSignal } from "../../../store/transform-store";
import { isSampleSignal } from "../../../store/image-store";
import { getPlanLimits } from "../../../config/plan-limits";
import { vectorKindFor, VECTOR_UNAVAILABLE_HINT } from "../../../engine/export/vector/vector-support";
import { openVectorUpgradePrompt } from "../../../lib/plan-gate/vector-export-gate";

interface SvgExportRowProps {
  transparentBg: boolean;
  plan: string;
  onDownloadSvg: (transparent: boolean) => void;
  onClose: () => void;
}

const ICON_SIZE = 12;
const ICON_STROKE = 1.6;
const ROW_CLASS = "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left text-[12px] text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent";
const HINT_CLASS = "block text-[12px] text-[var(--s-text-subtle)]";
const AVAILABLE_HINT = "Real vector dots, sharp at any size";

export const SvgExportRow: React.FC<SvgExportRowProps> = ({ transparentBg, plan, onDownloadSvg, onClose }) => {
  const modes = useSignalValue(modesSignal);
  const lutId = useSignalValue(lutIdSignal);
  const isSample = useSignalValue(isSampleSignal);
  const isVector = vectorKindFor(modes, lutId) !== null;
  const isLocked = !isSample && !getPlanLimits(plan).allowSvgExport;

  const handleClick = (): void => {
    if (isLocked) openVectorUpgradePrompt("svg_export_menu");
    else onDownloadSvg(transparentBg);
    onClose();
  };

  return (
    <button type="button" onClick={handleClick} disabled={!isVector} className={ROW_CLASS}>
      <span className="flex items-start gap-2">
        <PenTool size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mt-0.5" />
        <span>SVG<span className={HINT_CLASS}>{isVector ? AVAILABLE_HINT : VECTOR_UNAVAILABLE_HINT}</span></span>
      </span>
      {isLocked && isVector && (
        <span className="flex items-center gap-1 text-[12px] text-[var(--s-text-subtle)]">
          <Lock size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          Pro
        </span>
      )}
    </button>
  );
};
