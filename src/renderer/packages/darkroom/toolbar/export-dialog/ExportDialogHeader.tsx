import React from "react";
import { X } from "lucide-react";

const CLOSE_ICON_SIZE = 15;

interface ExportDialogHeaderProps {
  onClose: () => void;
}

export const ExportDialogHeader: React.FC<ExportDialogHeaderProps> = ({ onClose }) => (
  <div className="flex items-center justify-between gap-4 pl-4 pr-3 pt-3.5 pb-3">
    <h2 id="image-export-title" className="m-0 text-[14px] font-semibold text-[var(--s-text)]">
      Export
    </h2>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close export"
      className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
    >
      <X size={CLOSE_ICON_SIZE} strokeWidth={1.75} />
    </button>
  </div>
);
