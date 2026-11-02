import React from "react";
import { Download, Loader } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { exportingSignal } from "./use-export-handlers";

interface TopBarExportProps {
  onOpenPopup: () => void;
}

export const TopBarExport: React.FC<TopBarExportProps> = ({ onOpenPopup }) => {
  const isExporting = useSignalValue(exportingSignal);
  return (
    <button
      data-tutorial="studio-export"
      onClick={onOpenPopup}
      disabled={isExporting}
      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--s-text)] text-[var(--s-bg-panel)] border-none cursor-pointer text-[13px] font-semibold disabled:opacity-65 transition-opacity hover:opacity-90"
    >
      {isExporting ? <Loader size={13} className="animate-spin" /> : <Download size={13} strokeWidth={1.75} />}
      Export
    </button>
  );
};
