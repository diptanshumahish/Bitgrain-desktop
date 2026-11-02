import React from "react";
import { Search } from "lucide-react";
import { MOD_KEY } from "../../../editor/shortcut-labels";
import { openPalette } from "../state/palette-store";

export const PaletteSearchButton: React.FC = () => (
  <button
    type="button"
    data-tutorial="studio-search"
    onClick={() => openPalette("topbar_button")}
    aria-label="Search tools and actions"
    className="flex items-center gap-2 h-7 pl-2 pr-1.5 rounded-md border border-[var(--s-border)] bg-transparent text-[12px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors cursor-pointer"
  >
    <Search size={12} strokeWidth={2} aria-hidden="true" />
    <span className="hidden 2xl:inline">Search tools</span>
    <kbd className="rounded border border-[var(--s-border)] px-1 text-[12px] font-sans">{MOD_KEY.trim()}K</kbd>
  </button>
);
