import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { colorInputModeSignal } from "../../state/color-input-mode-store";
import type { ColorInputMode } from "./color-channels";

const MODES: Array<{ value: ColorInputMode; label: string }> = [
  { value: "hex", label: "Hex" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
];

export const ColorModeToggle: React.FC = () => {
  const mode = useSignalValue(colorInputModeSignal);
  return (
    <div className="flex items-center gap-0.5 rounded-md bg-[var(--s-bg-input)] p-[3px]">
      {MODES.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            colorInputModeSignal.value = option.value;
          }}
          className={`flex-1 rounded-[5px] h-6 text-[12px] font-medium transition-colors ${
            mode === option.value
              ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]"
              : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
