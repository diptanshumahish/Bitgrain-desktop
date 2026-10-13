import React from "react";
import { X } from "lucide-react";

interface AppliedChipProps {
  label: string;
  onRemove: () => void;
}

export const AppliedChip: React.FC<AppliedChipProps> = ({ label, onRemove }) => (
  <span className="h-8 inline-flex items-center gap-1 pl-3 pr-1 rounded-full bg-[var(--s-bg-panel)]/90 backdrop-blur-xl border border-[var(--s-border)] text-[13px] font-medium text-[var(--s-text)]">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      title={`Remove ${label}`}
      className="w-6 h-6 flex items-center justify-center rounded-full text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors"
    >
      <X size={13} strokeWidth={2.25} />
    </button>
  </span>
);
