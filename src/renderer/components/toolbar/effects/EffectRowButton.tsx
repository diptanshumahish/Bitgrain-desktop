import React from "react";
import { ChevronRight } from "lucide-react";
import type { EffectRow } from "./effect-rows";

interface EffectRowButtonProps {
  row: EffectRow;
}

export const EffectRowButton: React.FC<EffectRowButtonProps> = ({ row }) => (
  <button
    type="button"
    onClick={row.select}
    aria-pressed={row.active}
    className={`group flex items-center gap-2.5 w-full px-1.5 py-1.5 rounded-lg text-left transition-colors ${
      row.active ? "bg-[var(--s-accent-soft)]" : "hover:bg-[var(--s-bg-input-hover)]"
    }`}
  >
    <span
      className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center font-mono text-[13px] leading-none select-none transition-colors ${
        row.active ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)]"
      }`}
    >
      {row.glyph}
    </span>
    <span className="flex-1 min-w-0">
      <span className={`block text-[12px] font-medium leading-tight ${row.active ? "text-[var(--s-accent)]" : "text-[var(--s-text)]"}`}>
        {row.label}
      </span>
      <span className="block text-[12px] text-[var(--s-text-subtle)] leading-tight truncate">{row.hint}</span>
    </span>
    {row.key !== "original" && (
      <ChevronRight size={14} className="shrink-0 text-[var(--s-text-subtle)] group-hover:text-[var(--s-text-muted)]" />
    )}
  </button>
);
