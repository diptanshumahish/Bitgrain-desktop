import React from "react";

const countFormat = new Intl.NumberFormat();

interface FacetRowProps {
  label: string;
  count: number | null;
  isActive: boolean;
  onSelect: () => void;
}

export const FacetRow: React.FC<FacetRowProps> = ({ label, count, isActive, onSelect }) => (
  <button
    type="button"
    aria-pressed={isActive}
    disabled={count === 0 && !isActive}
    onClick={onSelect}
    className={`w-full h-8 flex items-center justify-between gap-2 px-2.5 rounded-md text-left text-[12px] transition-colors disabled:opacity-40 disabled:pointer-events-none ${
      isActive
        ? "bg-[var(--s-accent-soft)] font-semibold text-[var(--s-text)]"
        : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
    }`}
  >
    <span className="truncate">{label}</span>
    {count !== null && <span className="shrink-0 text-[11px] text-[var(--s-text-subtle)] tabular-nums">{countFormat.format(count)}</span>}
  </button>
);
