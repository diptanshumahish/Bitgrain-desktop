import React from "react";

interface BrowserTileProps {
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

const SELECTED_CLASS = "ring-2 ring-[var(--s-border-selected)] ring-offset-2 ring-offset-[var(--s-bg-panel)]";

export const BrowserTile: React.FC<BrowserTileProps> = ({ label, hint, selected, onSelect, children }) => (
  <button type="button" title={hint} aria-pressed={selected} onClick={onSelect} className="group flex flex-col gap-1.5 text-left">
    <span className={`block aspect-[4/3] w-full overflow-hidden rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] transition-transform group-hover:scale-[1.02] ${selected ? SELECTED_CLASS : ""}`}>
      {children}
    </span>
    <span className={`text-[12px] font-medium leading-tight truncate ${selected ? "text-[var(--s-text)]" : "text-[var(--s-text-muted)] group-hover:text-[var(--s-text)]"}`}>
      {label}
    </span>
  </button>
);
