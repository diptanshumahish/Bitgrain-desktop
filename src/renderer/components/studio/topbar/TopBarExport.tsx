import React from "react";
import { Download, Loader, ChevronDown } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { exportingSignal } from "./use-export-handlers";

interface TopBarExportProps {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onExport: () => void;
  onOpenPopup: () => void;
}

export const TopBarExport: React.FC<TopBarExportProps> = ({
  anchorRef, onExport, onOpenPopup,
}) => {
  const isExporting = useSignalValue(exportingSignal);

  return (
    <div
      ref={anchorRef}
      data-tutorial="studio-export"
      className="flex items-center h-8 bg-[var(--s-text)] rounded-lg overflow-hidden relative"
    >
      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 bg-transparent text-[var(--s-bg-panel)] border-none cursor-pointer text-[12px] font-medium px-3 h-full disabled:opacity-65 transition-colors hover:bg-white/10 active:bg-white/5"
      >
        {isExporting ? (
          <Loader size={12} className="animate-spin" />
        ) : (
          <Download size={12} strokeWidth={1.75} />
        )}
        <span>Export</span>
      </button>
      <button
        onClick={onOpenPopup}
        disabled={isExporting}
        aria-label="Export options"
        title="Export options"
        className="flex items-center justify-center bg-transparent text-[var(--s-bg-panel)] border-none border-l border-[var(--s-bg-panel)]/20 cursor-pointer w-6 h-full disabled:opacity-65 transition-colors hover:bg-white/10"
      >
        <ChevronDown size={11} strokeWidth={1.75} />
      </button>
    </div>
  );
};
