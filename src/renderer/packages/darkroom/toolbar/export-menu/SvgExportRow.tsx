import React from "react";
import { Lock, PenTool } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { modesSignal, lutIdSignal } from "../../state/transform-store";
import { isSampleSignal } from "../../state/image-store";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { vectorKindFor, VECTOR_UNAVAILABLE_HINT } from "@bitgrain/engine/export/vector/vector-support";
import { openVectorUpgradePrompt } from "@bitgrain/platform/plans/gate/vector-export-gate";
import { ExportOptionRow } from "./ExportOptionRow";

interface SvgExportRowProps {
  transparentBg: boolean;
  plan: string;
  onDownloadSvg: (transparent: boolean) => void;
  onClose: () => void;
}

const LOCK_ICON_SIZE = 12;
const AVAILABLE_HINT = "Real vector dots, sharp at any size";

const ProBadge: React.FC = () => (
  <span className="flex items-center gap-1 shrink-0 text-[12px] text-[var(--s-text-subtle)]">
    <Lock size={LOCK_ICON_SIZE} strokeWidth={1.75} />
    Pro
  </span>
);

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
    <ExportOptionRow
      icon={PenTool}
      title="SVG"
      hint={isVector ? AVAILABLE_HINT : VECTOR_UNAVAILABLE_HINT}
      onClick={handleClick}
      disabled={!isVector}
      trailing={isLocked && isVector ? <ProBadge /> : null}
    />
  );
};
