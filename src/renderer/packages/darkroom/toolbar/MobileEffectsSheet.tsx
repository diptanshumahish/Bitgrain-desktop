import React from "react";
import { ChevronRight, Clapperboard, Haze, Filter, Palette } from "lucide-react";
import type { ToolbarState } from "./use-toolbar-state";
import type { ActivePopover } from "./toolbar-types";
import { buildEffectRows } from "./effects/effect-rows";

interface MobileEffectsSheetProps {
  state: ToolbarState;
  toggle: (key: ActivePopover) => void;
  onClose: () => void;
}

interface EffectRow {
  key: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  active: boolean;
  locked: boolean;
  onSelect: () => void;
}

const Glyph: React.FC<{ chars: string }> = ({ chars }) => (
  <span className="font-mono text-[12px] leading-none select-none">{chars}</span>
);

export const MobileEffectsSheet: React.FC<MobileEffectsSheetProps> = ({ state: s, toggle, onClose }) => {
  const lutLocked = !!s.lutId;

  const open = (key: ActivePopover): void => {
    onClose();
    toggle(key);
  };

  const effectRows: EffectRow[] = buildEffectRows(s, open, onClose).map((row) => ({
    key: row.key,
    label: row.label,
    hint: row.hint,
    icon: <Glyph chars={row.glyph} />,
    active: row.active,
    locked: lutLocked,
    onSelect: row.select,
  }));

  const rows: EffectRow[] = [
    ...effectRows,
    {
      key: "lut",
      label: "Film grade",
      hint: "Film colour looks",
      icon: <Clapperboard size={16} strokeWidth={2} />,
      active: lutLocked,
      locked: false,
      onSelect: () => open("lut"),
    },
    {
      key: "haze-bloom",
      label: "Haze and glow",
      hint: "Soft atmospheric glow",
      icon: <Haze size={16} strokeWidth={2} />,
      active: s.hasActiveHazeBloom,
      locked: false,
      onSelect: () => open("haze-bloom"),
    },
    {
      key: "filters",
      label: "Filters",
      hint: "Invert, grayscale and more",
      icon: <Filter size={16} strokeWidth={2} />,
      active: s.hasActiveFilters,
      locked: lutLocked,
      onSelect: () => open("filters"),
    },
    {
      key: "palette",
      label: "Palette",
      hint: "Snap to a colour set",
      icon: <Palette size={16} strokeWidth={2} />,
      active: !!s.palette,
      locked: lutLocked,
      onSelect: () => open("palette"),
    },
  ];

  return (
    <div className="flex flex-col py-1.5">
      {rows.map((row) => (
        <button
          key={row.key}
          onClick={row.onSelect}
          disabled={row.locked}
          className="flex items-center gap-3 px-5 min-h-[48px] py-2 text-left transition-colors hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="w-7 h-7 flex items-center justify-center text-[var(--s-text-muted)] shrink-0">
            {row.icon}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] text-[var(--s-text)] leading-tight first-letter:uppercase">{row.label}</span>
            <span className="block text-[12px] text-[var(--s-text-subtle)] leading-tight first-letter:uppercase">
              {row.locked ? "Turn off the film grade to use this" : row.hint}
            </span>
          </span>
          {row.active && !row.locked && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--s-accent)] shrink-0" />
          )}
          <ChevronRight size={15} strokeWidth={2} className="text-[var(--s-text-subtle)] shrink-0" />
        </button>
      ))}
    </div>
  );
};
