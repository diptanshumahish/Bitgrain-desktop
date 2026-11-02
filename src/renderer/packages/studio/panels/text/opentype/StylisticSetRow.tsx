import React from "react";

interface StylisticSetRowProps {
  active: number[];
  onToggle: (set: number) => void;
}

const STYLISTIC_SETS = [1, 2, 3, 4, 5];

export const StylisticSetRow: React.FC<StylisticSetRowProps> = ({ active, onToggle }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[12px] text-[var(--s-text-subtle)] font-medium" title="Alternate letter shapes the font offers">Alternates</span>
    <div className="flex gap-[2px] bg-[var(--s-bg-input)] rounded-lg p-0.5">
      {STYLISTIC_SETS.map((set) => (
        <button
          key={set}
          type="button"
          title={`Stylistic set ${set}`}
          aria-pressed={active.includes(set)}
          onClick={() => onToggle(set)}
          className={`w-7 h-[24px] rounded-md border-none cursor-pointer text-[12px] font-semibold transition-colors duration-100 ${
            active.includes(set) ? "bg-[var(--s-bg-panel)] text-[var(--s-accent)]" : "bg-transparent text-[var(--s-text-subtle)]"
          }`}
        >
          {set}
        </button>
      ))}
    </div>
  </div>
);
