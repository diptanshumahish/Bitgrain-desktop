import React from "react";
import type { PaletteEntry } from "../entries/palette-entry";

interface PaletteResultRowProps {
  entry: PaletteEntry;
  optionId: string;
  active: boolean;
  onRun: (entry: PaletteEntry) => void;
  onHover: () => void;
}

export const PaletteResultRow: React.FC<PaletteResultRowProps> = ({ entry, optionId, active, onRun, onHover }) => (
  <li
    id={optionId}
    role="option"
    aria-selected={active}
    onMouseMove={onHover}
    onClick={() => onRun(entry)}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${active ? "bg-[var(--s-bg-input)]" : ""}`}
  >
    <span className="w-16 shrink-0 text-[11px] text-[var(--s-text-subtle)]">{entry.group}</span>
    <span className="flex-1 min-w-0 flex flex-col">
      <span className="text-[13px] text-[var(--s-text)] truncate">{entry.label}</span>
      {entry.hint && <span className="text-[11px] text-[var(--s-text-muted)] truncate">{entry.hint}</span>}
    </span>
    {entry.shortcut && (
      <kbd className="shrink-0 rounded-md border border-[var(--s-border)] px-1.5 py-0.5 text-[11px] text-[var(--s-text-muted)] font-sans">
        {entry.shortcut}
      </kbd>
    )}
  </li>
);
