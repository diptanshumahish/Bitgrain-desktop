import React from "react";
import { EasingGlyph } from "./EasingGlyph";
import { displayCurve, easingLabel, type EasingValue } from "./easing-presets";
import { openEasingEditor } from "./open-easing-editor";

interface EasingButtonProps {
  title: string;
  value: EasingValue;
  onCommit: (value: EasingValue) => void;
}

export const EasingButton: React.FC<EasingButtonProps> = ({ title, value, onCommit }) => (
  <button
    type="button"
    onClick={(event) => openEasingEditor(event.currentTarget, { title, initial: value, onCommit })}
    className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] text-[12px] text-[var(--s-text)] hover:border-[var(--s-border-hover)] transition-colors max-w-[140px]"
  >
    <EasingGlyph curve={displayCurve(value)} />
    <span className="truncate">{easingLabel(value)}</span>
  </button>
);
