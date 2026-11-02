import React from "react";
import { X } from "lucide-react";
import { Popover, PopoverSection } from "../Popover";
import type { TransformMode } from "../../../engine/types";
import { FILTER_ENTRIES } from "../filter-modes";
import { toggleStackedFilter } from "../effects/main-effect-modes";
import { pushHistory } from "../../../store/history-store";

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
  const toggle = (id: TransformMode): void => {
    setMode(toggleStackedFilter(mode, id));
    pushHistory();
  };
  const hasActive = FILTER_ENTRIES.some((entry) => mode.includes(entry.id));

  return (
    <Popover onClose={onClose} className="min-w-[200px]" static={isStatic}>
      <PopoverSection title="Filters">
        {FILTER_ENTRIES.map((entry) => {
          const isActive = mode.includes(entry.id);
          return (
            <button
              key={entry.id}
              onClick={() => toggle(entry.id)}
              aria-pressed={isActive}
              title={isActive ? `Remove ${entry.label.toLowerCase()}` : `Add ${entry.label.toLowerCase()}`}
              className={`group flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                  : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
              }`}
            >
              <span>{entry.label}</span>
              {isActive ? (
                <span className="flex items-center gap-1 shrink-0 ml-1 text-[12px]">
                  <span className="hidden group-hover:inline">remove</span>
                  <X size={11} strokeWidth={2.75} />
                </span>
              ) : (
                <span className="text-[11px] shrink-0 ml-1 text-[var(--s-text-subtle)]">
                  {entry.glyph}
                </span>
              )}
            </button>
          );
        })}
        {hasActive && (
          <p className="px-2 pt-2 text-[12px] text-[var(--s-text-subtle)] leading-tight">
            Filters stack on top of your effect. Click one again to remove it.
          </p>
        )}
      </PopoverSection>
    </Popover>
  );
};
