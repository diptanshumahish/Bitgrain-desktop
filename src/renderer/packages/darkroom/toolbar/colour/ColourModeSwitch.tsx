import React from "react";

interface ColourModeSwitchProps {
  isColor: boolean;
  onToggle: () => void;
}

const OPTIONS: { label: string; colour: boolean }[] = [
  { label: "Colour", colour: true },
  { label: "Black and white", colour: false },
];

export const ColourModeSwitch: React.FC<ColourModeSwitchProps> = ({ isColor, onToggle }) => (
  <div role="radiogroup" aria-label="Colour mode" className="mx-2 my-1 flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5">
    {OPTIONS.map((option) => {
      const selected = option.colour === isColor;
      return (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => !selected && onToggle()}
          className={`flex-1 h-7 rounded text-[12px] font-medium transition-colors ${selected ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]" : "text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)]"}`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
