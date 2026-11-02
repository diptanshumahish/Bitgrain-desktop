import React from "react";
import type { RGB } from "@bitgrain/core/color/rgb";
import { hexToRgb, rgbToHex } from "./rgb-hex";

interface ColourFieldProps {
  label: string;
  value: RGB;
  onChange: (value: RGB) => void;
  onCommit: () => void;
}

export const ColourField: React.FC<ColourFieldProps> = ({ label, value, onChange, onCommit }) => {
  const hex = rgbToHex(value);
  return (
    <label className="relative flex items-center gap-2.5 h-11 px-2.5 rounded-lg border border-[var(--s-border)] cursor-pointer hover:bg-[var(--s-bg-input-hover)] transition-colors">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
        <circle cx="12" cy="12" r="11" fill={hex} stroke="var(--s-border)" strokeWidth="1" />
      </svg>
      <span className="min-w-0">
        <span className="block text-[12px] font-medium leading-tight text-[var(--s-text)]">{label}</span>
        <span className="block text-[12px] leading-tight mt-0.5 font-mono text-[var(--s-text-subtle)]">{hex}</span>
      </span>
      <input
        type="color"
        aria-label={`${label} colour`}
        value={hex}
        onChange={(event) => onChange(hexToRgb(event.target.value))}
        onBlur={onCommit}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </label>
  );
};
