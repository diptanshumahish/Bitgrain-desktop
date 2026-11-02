import React from "react";
import { Download, Loader, Save } from "lucide-react";

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
    <button
      onClick={onExport}
      disabled={exporting}
      className="flex items-center justify-center gap-2 bg-[var(--s-text)] text-[var(--s-bg-panel)] border-none cursor-pointer text-[12.5px] font-medium font-inherit h-10 w-full disabled:opacity-65 transition-all hover:brightness-110 active:scale-[0.99] rounded-xl"
    >
      {exporting ? (
        <Loader size={ICON_SIZE} className="animate-spin" />
      ) : (
        <Download size={ICON_SIZE} strokeWidth={1.75} />
      )}
      {downloadLabel}
    </button>
    <button
      onClick={onSaveBtg}
      className="flex items-center justify-center gap-2 bg-[var(--s-bg-input)] text-[var(--s-text)] border-none cursor-pointer text-[12px] font-medium font-inherit h-9 w-full transition-all hover:bg-[var(--s-bg-input-hover)] rounded-xl"
    >
      <Save size={ICON_SIZE} strokeWidth={1.5} />
      Save as .btg project
    </button>
  </div>
);
