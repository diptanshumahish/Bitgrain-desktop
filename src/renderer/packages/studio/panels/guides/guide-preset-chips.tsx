import React from "react";
import type { GuidePreset } from "./guide-presets";

interface GuidePresetChipsProps {
  onApply: (preset: GuidePreset) => void;
  onClear: () => void;
}

const PRESETS: { value: GuidePreset; label: string; title: string }[] = [
  { value: "center", label: "Center", title: "Add lines through the middle" },
  { value: "thirds", label: "Thirds", title: "Add rule of thirds lines" },
  { value: "margins", label: "Margins", title: "Add a safe area box inset by your margin" },
  { value: "repeat", label: "Repeat", title: "Add lines across the page at your spacing" },
];

const CHIP_CLASS =
  "h-7 rounded-md bg-[var(--s-bg-input)] text-[12px] font-medium text-[var(--s-text-muted)] transition-colors hover:text-[var(--s-text)]";

export const GuidePresetChips: React.FC<GuidePresetChipsProps> = ({ onApply, onClear }) => (
  <div className="grid grid-cols-3 gap-1">
    {PRESETS.map((preset) => (
      <button key={preset.value} type="button" title={preset.title} onClick={() => onApply(preset.value)} className={CHIP_CLASS}>
        {preset.label}
      </button>
    ))}
    <button type="button" title="Remove every line and box" onClick={onClear} className={CHIP_CLASS}>
      Clear
    </button>
  </div>
);
