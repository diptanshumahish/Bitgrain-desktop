import React from "react";
import type { BrowserFamily } from "./browser-entries";

interface FamilyNavProps {
  families: readonly BrowserFamily[];
  active: string;
  allId: string;
  onSelect: (familyId: string) => void;
}

const ITEM_ACTIVE = "bg-[var(--s-bg-input)] text-[var(--s-text)]";
const ITEM_IDLE = "text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)]";

interface NavItemProps {
  label: string;
  count: number;
  selected: boolean;
  onSelect: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, count, selected, onSelect }) => (
  <button type="button" onClick={onSelect} aria-pressed={selected}
    className={`w-full h-8 flex items-center justify-between px-2.5 rounded-md text-[12px] font-medium transition-colors ${selected ? ITEM_ACTIVE : ITEM_IDLE}`}>
    {label}
    <span className="text-[12px] tabular-nums text-[var(--s-text-subtle)]">{count}</span>
  </button>
);

export const FamilyNav: React.FC<FamilyNavProps> = ({ families, active, allId, onSelect }) => (
  <nav aria-label="Style families" className="w-44 shrink-0 flex flex-col gap-0.5 p-3 border-r border-[var(--s-border)] overflow-y-auto">
    <NavItem label="All styles" count={families.reduce((sum, family) => sum + family.entries.length, 0)} selected={active === allId} onSelect={() => onSelect(allId)} />
    <div className="h-px bg-[var(--s-border)] my-2" />
    {families.map((family) => (
      <NavItem key={family.id} label={family.label} count={family.entries.length} selected={active === family.id} onSelect={() => onSelect(family.id)} />
    ))}
  </nav>
);
