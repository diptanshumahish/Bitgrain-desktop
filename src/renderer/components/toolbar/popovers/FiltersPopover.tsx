import React from "react";
import { X } from "lucide-react";
import { Popover, PopoverSection } from "../Popover";
import type { TransformMode } from "../../../engine/types";
import { FILTER_ENTRIES } from "../filter-modes";

interface FiltersPopoverProps {
  mode: TransformMode[];
  setMode: (m: TransformMode[]) => void;
  onClose: () => void;
  static?: boolean;
}

export const FiltersPopover: React.FC<FiltersPopoverProps> = ({
  mode,
  setMode,
  onClose,
  static: isStatic,
}) => {
  const toggle = (id: TransformMode) =>
    setMode(mode.includes(id) ? ["dither"] : [id]);
  const hasActive = FILTER_ENTRIES.some((entry) => mode.includes(entry.id));

  return (
    <Popover onClose={onClose} className="min-w-[160px]" static={isStatic}>
      <PopoverSection title="Filters">
        {FILTER_ENTRIES.map((entry) => {
          const isActive = mode.includes(entry.id);
          return (
            <button
              key={entry.id}
              onClick={() => toggle(entry.id)}
              aria-pressed={isActive}
              title={isActive ? "Click to remove" : undefined}
              className={`group flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                isActive
                  ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                  : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
              }`}
            >
              <span>{entry.label}</span>
              {isActive ? (
                <span className="flex items-center gap-1 shrink-0 ml-1 text-[9px]">
                  <span className="hidden group-hover:inline">remove</span>
                  <X size={11} strokeWidth={2.75} />
                </span>
              ) : (
                <span className="text-[9px] shrink-0 ml-1 text-[var(--s-text-subtle)]">
                  {entry.glyph}
                </span>
              )}
            </button>
          );
        })}
        {hasActive && (
          <p className="px-2 pt-2 text-[9px] text-[var(--s-text-subtle)] leading-tight">
            Click the highlighted filter to remove it.
          </p>
        )}
      </PopoverSection>
    </Popover>
  );
};
