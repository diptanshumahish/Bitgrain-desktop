import React from "react";
import { Link2, Unlink } from "lucide-react";

interface LinkedTokenChipProps {
  label: string;
  name: string;
  onDetach: () => void;
}

export const LinkedTokenChip: React.FC<LinkedTokenChipProps> = ({ label, name, onDetach }) => (
  <div className="flex items-center gap-2 rounded-lg bg-[var(--s-bg-input)] h-[28px] pl-2 pr-1">
    <Link2 size={12} strokeWidth={1.75} className="text-[var(--s-text-subtle)] shrink-0" />
    <span className="text-[12px] text-[var(--s-text-subtle)] shrink-0">{label}</span>
    <span className="flex-1 min-w-0 truncate text-[12px] text-[var(--s-text)] font-medium">{name}</span>
    <button
      type="button"
      onClick={onDetach}
      title="Detach"
      aria-label={`Detach ${label.toLowerCase()}`}
      className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors shrink-0"
    >
      <Unlink size={12} strokeWidth={1.75} />
    </button>
  </div>
);
