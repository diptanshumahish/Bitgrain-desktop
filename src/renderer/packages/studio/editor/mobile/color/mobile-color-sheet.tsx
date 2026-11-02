import React from "react";
import { Pipette } from "lucide-react";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { ColorSwatchButton } from "./color-swatch-button";
import { isHexColor } from "./collect-document-colors";

interface MobileColorSheetProps {
  title: string;
  value: string;
  palette: string[];
  onChange: (color: string) => void;
  onClose: () => void;
}

const FALLBACK_PICKER_COLOR = "#000000";
const PICKER_ICON_SIZE = 18;

export const MobileColorSheet: React.FC<MobileColorSheetProps> = ({ title, value, palette, onChange, onClose }) => {
  const current = isHexColor(value) ? value.toLowerCase() : FALLBACK_PICKER_COLOR;

  return (
    <MobileSheet title={title} onClose={onClose} dimmed={false}>
      <p className="m-0 px-5 pb-2 text-[12px] text-[var(--s-text-muted)]">Colors in this design</p>
      <div className="flex flex-wrap gap-3 px-5 pb-4">
        {palette.map((color) => (
          <ColorSwatchButton key={color} color={color} active={color === current} onPick={onChange} />
        ))}
        <label className="relative w-11 h-11 rounded-full border border-dashed border-[var(--s-text-subtle)] flex items-center justify-center text-[var(--s-text-muted)] cursor-pointer">
          <Pipette size={PICKER_ICON_SIZE} strokeWidth={2} />
          <input
            type="color"
            value={current}
            aria-label="Pick a custom color"
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </MobileSheet>
  );
};
