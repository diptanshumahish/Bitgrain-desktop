import React from "react";
import { Pipette, X } from "lucide-react";
import type { Palette } from "@bitgrain/engine/core/types";

const ICON_SIZE = 12;
const ACTION_CLASS = "flex items-center gap-1 h-6 px-2 rounded-md border border-[var(--s-border)] text-[12px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

interface PaletteHeaderProps {
  palette: Palette | null;
  hint: string;
  disabled: boolean;
  onFromPhoto: () => void;
  onClear: () => void;
}

export const PaletteHeader: React.FC<PaletteHeaderProps> = ({ palette, hint, disabled, onFromPhoto, onClear }) => (
  <div className="flex items-start justify-between gap-2">
    <span className="min-w-0">
      <span className="block text-[12px] font-medium leading-tight text-[var(--s-text)]">Palette</span>
      <span className="block truncate text-[12px] text-[var(--s-text-subtle)] leading-tight mt-0.5">{palette ? palette.name : hint}</span>
    </span>
    <span className="flex items-center gap-1 shrink-0">
      {palette && (
        <button type="button" onClick={onClear} disabled={disabled} aria-label="Remove palette" className={ACTION_CLASS}>
          <X size={ICON_SIZE} strokeWidth={1.75} />
        </button>
      )}
      <button type="button" onClick={onFromPhoto} disabled={disabled} className={ACTION_CLASS}>
        <Pipette size={ICON_SIZE} strokeWidth={1.75} />
        From photo
      </button>
    </span>
  </div>
);
