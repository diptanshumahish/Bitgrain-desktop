import React from "react";
import { Check } from "lucide-react";
import type { FilterEntry } from "../../filter-modes";

const ACTIVE_CLASS = "bg-[var(--s-bg-input)] border-[var(--s-border-selected)] text-[var(--s-text)]";
const IDLE_CLASS = "border-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]";

interface FilterRowProps {
  entry: FilterEntry;
  active: boolean;
  onToggle: () => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({ entry, active, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={active}
    aria-label={active ? `Remove ${entry.label.toLowerCase()}` : `Add ${entry.label.toLowerCase()}`}
    className={`flex items-center gap-3 w-full h-9 px-2.5 rounded-lg border text-[12px] font-medium transition-colors ${active ? ACTIVE_CLASS : IDLE_CLASS}`}
  >
    <span className="w-9 shrink-0 text-left font-mono text-[12px] text-[var(--s-text-subtle)]" aria-hidden="true">
      {entry.glyph}
    </span>
    <span className="flex-1 text-left">{entry.label}</span>
    {active && (
      <span className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center bg-[var(--s-accent)] text-[var(--s-accent-text)]">
        <Check size={10} strokeWidth={3} />
      </span>
    )}
  </button>
);
