import React from "react";
import { Download } from "lucide-react";
import { emitPopover } from "../../../lib/event-bus";
import type { AnimationFormat } from "../../../engine/animate/export-page-animation";
import {
  useAnimationExporting,
  useAnimationExportProgress,
} from "../../../store/animation-export-store";
import { AnimationExportPanel } from "./AnimationExportPanel";

interface AnimationExportMenuProps {
  onExport: (format: AnimationFormat) => void;
  baseWidth: number;
  baseHeight: number;
}

export const AnimationExportMenu: React.FC<AnimationExportMenuProps> = ({ onExport, baseWidth, baseHeight }) => {
  const exporting = useAnimationExporting();
  const progress = useAnimationExportProgress();

  const openPanel = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    emitPopover({
      type: "tool-dropdown",
      anchorRect: rect,
      content: <AnimationExportPanel onExport={onExport} baseWidth={baseWidth} baseHeight={baseHeight} />,
    });
  };

  return (
    <button
      type="button"
      onClick={openPanel}
      className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[11px] font-medium shrink-0 transition-opacity hover:opacity-90"
    >
      <Download size={13} strokeWidth={2} />
      {exporting ? `Exporting ${Math.round(progress * 100)}%` : "Export"}
    </button>
  );
};
