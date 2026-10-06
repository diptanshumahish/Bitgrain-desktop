import React from "react";
import { FILTER_MODES } from "./mode-options";
import type { TransformMode } from "../../../types";

interface EffectMenuProps {
  onPick: (mode: TransformMode) => void;
}

export const EffectMenu: React.FC<EffectMenuProps> = ({ onPick }) => (
  <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl p-1 flex flex-col min-w-[180px] max-h-[280px] overflow-y-auto no-scrollbar font-editorial">
    <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold text-[var(--s-text-subtle)]  ">
      Add effect
    </div>
    {FILTER_MODES.map((mode) => (
      <button
        key={mode.id}
        type="button"
        onClick={() => onPick(mode.id)}
        className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 text-[11.5px] text-[var(--s-text)] rounded-lg hover:bg-[var(--s-bg-input)] transition-colors"
      >
        <span aria-hidden className="font-mono text-[9px] text-[var(--s-text-subtle)] w-6">
          {mode.glyph}
        </span>
        {mode.label}
      </button>
    ))}
  </div>
);
