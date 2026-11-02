import React from "react";

interface FiltersHeaderProps {
  activeCount: number;
  onClearAll: () => void;
}

const summaryFor = (count: number): string =>
  count === 0 ? "Stack any of these on your effect" : `${count} applied`;

export const FiltersHeader: React.FC<FiltersHeaderProps> = ({ activeCount, onClearAll }) => (
  <div className="flex items-center justify-between gap-2 px-2.5 pt-1 pb-2">
    <span className="text-[12px] text-[var(--s-text-subtle)]">{summaryFor(activeCount)}</span>
    {activeCount > 0 && (
      <button
        type="button"
        onClick={onClearAll}
        className="h-6 px-2 rounded-md border border-[var(--s-border)] text-[12px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors"
      >
        Clear all
      </button>
    )}
  </div>
);
