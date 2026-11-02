import React from "react";
import type { Palette } from "@bitgrain/engine/core/types";
import { PaletteStrip } from "./PaletteStrip";

const SELECTED_CLASS = "border-[var(--s-border-selected)]";
const IDLE_CLASS = "border-[var(--s-border)] hover:border-[var(--s-border-hover)]";

interface PaletteCardProps {
  palette: Palette;
  selected: boolean;
  disabled: boolean;
  onSelect: (palette: Palette) => void;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({ palette, selected, disabled, onSelect }) => (
  <button
    type="button"
    aria-pressed={selected}
    disabled={disabled}
    onClick={() => onSelect(palette)}
    className={`flex flex-col gap-1.5 p-1 rounded-lg border text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${selected ? SELECTED_CLASS : IDLE_CLASS}`}
  >
    <PaletteStrip colours={palette.colors} className="block w-full h-6 rounded-[5px] overflow-hidden" />
    <span className={`px-0.5 pb-0.5 truncate text-[12px] leading-tight ${selected ? "text-[var(--s-text)] font-medium" : "text-[var(--s-text-muted)]"}`}>
      {palette.name}
    </span>
  </button>
);
