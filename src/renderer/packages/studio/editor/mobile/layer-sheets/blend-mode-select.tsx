import React from "react";
import type { BlendMode } from "@bitgrain/studio-core/model/studio-types";
import { BLEND_MODE_OPTIONS } from "../../../ui/blend-modes";

interface BlendModeSelectProps {
  value?: BlendMode;
  onChange: (mode: BlendMode) => void;
}

const SELECT_CLASS =
  "max-w-[200px] h-11 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-input)] px-3 text-[14px] text-[var(--s-text)] outline-none";

export const BlendModeSelect: React.FC<BlendModeSelectProps> = ({ value, onChange }) => (
  <select
    aria-label="Blend mode"
    value={value ?? "normal"}
    onChange={(event) => onChange(event.target.value as BlendMode)}
    className={SELECT_CLASS}
  >
    {BLEND_MODE_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);
