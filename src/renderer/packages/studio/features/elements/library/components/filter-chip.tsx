import React from "react";
import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
  <span className="h-7 max-w-[240px] flex items-center gap-1 pl-2.5 pr-1 rounded-full bg-[var(--s-accent-soft)] text-[11.5px] font-medium text-[var(--s-text)]">
    <span className="truncate">{label}</span>
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
    >
      <X size={11} strokeWidth={2.25} />
    </button>
  </span>
);
