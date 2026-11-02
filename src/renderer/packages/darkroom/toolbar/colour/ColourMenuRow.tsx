import React from "react";
import { ChevronRight } from "lucide-react";

interface ColourMenuRowProps {
  icon: React.ReactNode;
  label: string;
  hint: string;
  active: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onSelect: () => void;
}

export const ColourMenuRow: React.FC<ColourMenuRowProps> = ({
  icon,
  label,
  hint,
  active,
  disabled,
  disabledHint,
  onSelect,
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className="group flex items-center gap-3 w-full px-2 py-2 rounded-lg text-left transition-colors hover:bg-[var(--s-bg-input-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-muted)]">
      {icon}
    </span>
    <span className="flex-1 min-w-0">
      <span className="flex items-center gap-1.5 text-[12px] font-medium leading-tight text-[var(--s-text)]">
        {label}
        {active && <span className="w-1.5 h-1.5 rounded-full bg-[var(--s-accent)]" aria-label="on" />}
      </span>
      <span className="block truncate text-[12px] text-[var(--s-text-subtle)] leading-tight mt-0.5">
        {disabled && disabledHint ? disabledHint : hint}
      </span>
    </span>
    <ChevronRight size={14} className="shrink-0 text-[var(--s-text-subtle)] group-hover:text-[var(--s-text-muted)]" />
  </button>
);
