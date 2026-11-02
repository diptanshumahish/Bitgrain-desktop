import React from "react";
import { PALETTE_GROUPS } from "./palette-groups";
import { selectPaletteGroup } from "./palette-group-store";

interface PaletteGroupTabsProps {
  activeGroup: string;
  selectedGroup: string | null;
}

export const PaletteGroupTabs: React.FC<PaletteGroupTabsProps> = ({ activeGroup, selectedGroup }) => (
  <div role="tablist" aria-label="Palette groups" className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5">
    {PALETTE_GROUPS.map((group) => {
      const active = group.title === activeGroup;
      return (
        <button
          key={group.title}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => selectPaletteGroup(group.title)}
          className={`relative flex-1 h-6 rounded text-[12px] font-medium transition-colors ${active ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]" : "text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)]"}`}
        >
          {group.title}
          {group.title === selectedGroup && !active && (
            <span aria-label="has your palette" className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-[var(--s-text)]" />
          )}
        </button>
      );
    })}
  </div>
);
