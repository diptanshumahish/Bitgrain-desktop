import React from "react";
import { Check } from "lucide-react";

interface ColorSwatchButtonProps {
  color: string;
  active: boolean;
  onPick: (color: string) => void;
}

const CHECK_SIZE = 16;

export const ColorSwatchButton: React.FC<ColorSwatchButtonProps> = ({ color, active, onPick }) => (
  <button
    type="button"
    onClick={() => onPick(color)}
    aria-label={`Use ${color}`}
    aria-pressed={active}
    className={`relative w-11 h-11 rounded-full border border-[var(--s-border)] flex items-center justify-center ${
      active ? "ring-2 ring-offset-2 ring-[var(--s-text)] ring-offset-[var(--s-bg-panel)]" : ""
    }`}
  >
    <span style={{ background: color }} className="absolute inset-0.5 rounded-full" />
    {active && <Check size={CHECK_SIZE} strokeWidth={2.5} className="relative mix-blend-difference text-white" />}
  </button>
);
