import React from "react";
import { Save } from "lucide-react";
import { ExportMorphButton } from "@bitgrain/darkroom/motion/export-morph/ExportMorphButton";

interface ExportActionsProps {
  exporting: boolean;
  downloadLabel: string;
  onSaveBtg: () => void;
  onExport: () => void;
}

const ICON_SIZE = 13;

export const ExportActions: React.FC<ExportActionsProps> = ({
  exporting,
  downloadLabel,
  onSaveBtg,
  onExport,
}) => (
  <div className="flex flex-col gap-2">
    <ExportMorphButton exporting={exporting} label={downloadLabel} onClick={onExport} />
    <button
      onClick={onSaveBtg}
      className="flex items-center justify-center gap-2 bg-[var(--s-bg-input)] text-[var(--s-text)] border-none cursor-pointer text-[12px] font-medium font-inherit h-9 w-full transition-all hover:bg-[var(--s-bg-input-hover)] rounded-xl"
    >
      <Save size={ICON_SIZE} strokeWidth={1.5} />
      Save as .btg project
    </button>
  </div>
);
