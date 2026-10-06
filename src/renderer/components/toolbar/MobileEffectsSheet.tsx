import React from "react";
import { ChevronRight, Clapperboard, Haze, Filter, Palette, Brush } from "lucide-react";
import { emitModal } from "../../lib/event-bus";
import type { ToolbarState } from "./use-toolbar-state";
import type { ActivePopover } from "./DesktopToolbar";

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

  const rows: EffectRow[] = [
    {
      key: "algorithm",
      label: "dither",
      hint: "floyd, atkinson, bayer",
      icon: <Glyph chars="▒▓░" />,
      active: s.mode.includes("dither"),
      locked: lutLocked,
      onSelect: () => {
        onClose();
        if (!s.mode.includes("dither")) s.selectDither();
        toggle("algorithm");
      },
    },
    {
      key: "halftone",
      label: "halftone",
      hint: "newsprint dots",
      icon: <Glyph chars="·∶∷▓" />,
      active: s.isHalftoneActive,
      locked: lutLocked,
      onSelect: () => open("halftone"),
    },
    {
      key: "popart",
      label: "pop art",
      hint: "comic dot ink",
      icon: <Glyph chars="◍◍" />,
      active: s.mode.includes("popart"),
      locked: lutLocked,
      onSelect: () => open("popart"),
    },
    {
      key: "ascii",
      label: "ascii",
      hint: "characters, tone, detail",
      icon: <Glyph chars="@%:" />,
      active: s.isAsciiActive,
      locked: lutLocked,
      onSelect: () => {
        if (!s.isAsciiActive) s.toggleAscii();
        open("ascii");
      },
    },
    {
      key: "braille",
      label: "braille",
      hint: "2x4 dot micro-detail",
      icon: <Glyph chars="⠿⠦" />,
      active: s.isBrailleActive,
      locked: lutLocked,
      onSelect: () => {
        if (!s.isBrailleActive) s.toggleBraille();
        open("braille");
      },
    },
    {
      key: "contour",
      label: "contour",
      hint: "topographic lines",
      icon: <Glyph chars="◠◡" />,
      active: s.isContourActive,
      locked: lutLocked,
      onSelect: () => {
        if (!s.isContourActive) s.toggleContour();
        open("contour");
      },
    },
    {
      key: "inkwash",
      label: "ink wash",
      hint: "tonal wash, inked lines",
      icon: <Glyph chars="▟▖" />,
      active: s.isInkwashActive,
      locked: lutLocked,
      onSelect: () => open("inkwash"),
    },
    {
      key: "manga",
      label: "manga",
      hint: "crosshatch, inked lines",
      icon: <Glyph chars="▨▧" />,
      active: s.isMangaActive,
      locked: lutLocked,
      onSelect: () => open("manga"),
    },
    {
      key: "lut",
      label: "film grade",
      hint: "lut color looks",
      icon: <Clapperboard size={16} strokeWidth={2} />,
      active: lutLocked,
      locked: false,
      onSelect: () => open("lut"),
    },
    {
      key: "haze-bloom",
      label: "haze & bloom",
      hint: "atmospheric glow",
      icon: <Haze size={16} strokeWidth={2} />,
      active: s.hasActiveHazeBloom,
      locked: false,
      onSelect: () => open("haze-bloom"),
    },
    {
      key: "filters",
      label: "filters",
      hint: "invert, grade, more",
      icon: <Filter size={16} strokeWidth={2} />,
      active: s.hasActiveFilters,
      locked: lutLocked,
      onSelect: () => open("filters"),
    },
    {
      key: "palette",
      label: "palette",
      hint: "snap to a color set",
      icon: <Palette size={16} strokeWidth={2} />,
      active: !!s.palette,
      locked: lutLocked,
      onSelect: () => open("palette"),
    },
    {
      key: "brush",
      label: "selective brush",
      hint: "paint the effect in",
      icon: <Brush size={16} strokeWidth={2} />,
      active: false,
      locked: false,
      onSelect: () => {
        onClose();
        emitModal({ type: "selective-effect" });
      },
    },
  ];

  return (
    <div className="flex flex-col py-1.5">
      {rows.map((row) => (
        <button
          key={row.key}
          onClick={row.onSelect}
          disabled={row.locked}
          className="flex items-center gap-3 px-5 min-h-[52px] py-2.5 text-left transition-colors hover:bg-[var(--s-bg-input-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="w-7 h-7 flex items-center justify-center text-[var(--s-text-muted)] shrink-0">
            {row.icon}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] text-[var(--s-text)] leading-tight">{row.label}</span>
            <span className="block text-[11px] text-[var(--s-text-subtle)] leading-tight">
              {row.locked ? "locked while a film grade is on" : row.hint}
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
