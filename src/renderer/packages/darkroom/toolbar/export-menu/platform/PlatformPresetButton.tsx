import React from "react";
import type { PlatformPreset } from "../../platform-presets";

interface PlatformPresetButtonProps {
  preset: PlatformPreset;
  selected: boolean;
  onChoose: (preset: PlatformPreset) => void;
}

const SELECTED_CLASSES = "border-[var(--s-border-strong)] bg-[var(--s-bg-input-hover)]";
const IDLE_CLASSES = "border-[var(--s-border)] hover:bg-[var(--s-bg-input-hover)]";

export const PlatformPresetButton: React.FC<PlatformPresetButtonProps> = ({ preset, selected, onChoose }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={() => onChoose(preset)}
    className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg border text-left transition-colors ${selected ? SELECTED_CLASSES : IDLE_CLASSES}`}
  >
    <span className="text-[12px] font-medium text-[var(--s-text)]">{preset.label}</span>
    <span className="text-[12px] text-[var(--s-text-subtle)] tabular-nums">{preset.sub}</span>
  </button>
);
