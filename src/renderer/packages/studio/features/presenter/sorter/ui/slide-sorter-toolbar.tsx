import React from "react";
import { Copy, Trash2, X } from "lucide-react";

interface SlideSorterToolbarProps {
  pageCount: number;
  selectedCount: number;
  canDelete: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ACTION_BUTTON =
  "h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[12px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] disabled:opacity-40 disabled:pointer-events-none transition-colors";

const describeCount = (pageCount: number, selectedCount: number): string => {
  const pagesLabel = `${pageCount} ${pageCount === 1 ? "slide" : "slides"}`;
  return selectedCount > 0 ? `${pagesLabel}, ${selectedCount} selected` : pagesLabel;
};

export const SlideSorterToolbar: React.FC<SlideSorterToolbarProps> = ({
  pageCount, selectedCount, canDelete, onDuplicate, onDelete, onClose,
}) => (
  <div className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)]">
    <span className="text-[13px] font-medium text-[var(--s-text)]">Slide sorter</span>
    <span className="text-[12px] text-[var(--s-text-subtle)] tabular-nums">{describeCount(pageCount, selectedCount)}</span>
    <span className="hidden md:inline text-[12px] text-[var(--s-text-subtle)]">
      Drag to reorder, double-click a slide to open it
    </span>
    <div className="ml-auto flex items-center gap-1">
      <button type="button" onClick={onDuplicate} disabled={selectedCount === 0} className={ACTION_BUTTON}>
        <Copy size={13} strokeWidth={1.75} />
        Duplicate
      </button>
      <button type="button" onClick={onDelete} disabled={!canDelete} className={ACTION_BUTTON}>
        <Trash2 size={13} strokeWidth={1.75} />
        Delete
      </button>
      <div className="w-px h-4 bg-[var(--s-border)] mx-1" />
      <button type="button" onClick={onClose} aria-label="Close slide sorter" className={ACTION_BUTTON}>
        <X size={13} strokeWidth={1.75} />
        Done
      </button>
    </div>
  </div>
);
