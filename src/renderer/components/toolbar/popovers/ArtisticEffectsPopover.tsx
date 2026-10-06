import React from "react";
import { ChevronRight } from "lucide-react";
import { Popover } from "../Popover";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";

interface ArtisticEffectsPopoverProps {
  state: ToolbarState;
  onOpen: (key: ActivePopover) => void;
  onClose: () => void;
  static?: boolean;
}

interface EffectRow {
  key: ActivePopover;
  label: string;
  hint: string;
  glyph: string;
  active: boolean;
  select: () => void;
}

interface EffectGroup {
  title: string;
  rows: EffectRow[];
}

export const ArtisticEffectsPopover: React.FC<ArtisticEffectsPopoverProps> = ({
  state: s,
  onOpen,
  onClose,
  static: isStatic,
}) => {
  const groups: EffectGroup[] = [
    {
      title: "Comic & text",
      rows: [
        {
          key: "popart",
          label: "pop grunge",
          hint: "comic dot ink",
          glyph: "◉",
          active: s.isPopartActive,
          select: () => {
            if (!s.isPopartActive) s.togglePopart();
            onOpen("popart");
          },
        },
        {
          key: "ascii",
          label: "ascii",
          hint: "characters as tone",
          glyph: "@",
          active: s.isAsciiActive,
          select: () => {
            if (!s.isAsciiActive) s.toggleAscii();
            onOpen("ascii");
          },
        },
        {
          key: "braille",
          label: "braille",
          hint: "micro dot detail",
          glyph: "⠿",
          active: s.isBrailleActive,
          select: () => {
            if (!s.isBrailleActive) s.toggleBraille();
            onOpen("braille");
          },
        },
      ],
    },
    {
      title: "Line & ink",
      rows: [
        {
          key: "contour",
          label: "contour",
          hint: "topographic lines",
          glyph: "≈",
          active: s.isContourActive,
          select: () => {
            if (!s.isContourActive) s.toggleContour();
            onOpen("contour");
          },
        },
        {
          key: "inkwash",
          label: "ink wash",
          hint: "tonal wash, inked lines",
          glyph: "◗",
          active: s.isInkwashActive,
          select: () => {
            if (!s.isInkwashActive) s.toggleInkwash();
            onOpen("inkwash");
          },
        },
        {
          key: "manga",
          label: "manga",
          hint: "crosshatch, inked lines",
          glyph: "▨",
          active: s.isMangaActive,
          select: () => {
            if (!s.isMangaActive) s.toggleManga();
            onOpen("manga");
          },
        },
      ],
    },
  ];

  return (
    <Popover onClose={onClose} className="w-64" static={isStatic}>
      <div className="max-h-[68vh] overflow-y-auto p-1.5">
        <p className="text-[11px] font-semibold text-[var(--s-text)] px-2 pt-1 pb-2">
          Artistic effects
        </p>
        {groups.map((group) => (
          <div key={group.title} className="mb-1 last:mb-0">
            <p className="text-[9px] font-medium text-[var(--s-text-subtle)] px-2 pb-1">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.rows.map((row) => (
                <button
                  key={row.key}
                  onClick={row.select}
                  className={`group flex items-center gap-2.5 w-full px-1.5 py-1.5 rounded-lg text-left transition-colors ${
                    row.active ? "bg-[var(--s-accent-soft)]" : "hover:bg-[var(--s-bg-input-hover)]"
                  }`}
                >
                  <span
                    className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center font-mono text-[13px] leading-none select-none transition-colors ${
                      row.active
                        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                        : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)]"
                    }`}
                  >
                    {row.glyph}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-[12px] font-medium leading-tight ${
                        row.active ? "text-[var(--s-accent)]" : "text-[var(--s-text)]"
                      }`}
                    >
                      {row.label}
                    </span>
                    <span className="block text-[10px] text-[var(--s-text-subtle)] leading-tight truncate">
                      {row.hint}
                    </span>
                  </span>
                  <ChevronRight
                    size={14}
                    className={`shrink-0 transition-colors ${
                      row.active
                        ? "text-[var(--s-accent)]"
                        : "text-[var(--s-text-subtle)] group-hover:text-[var(--s-text-muted)]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Popover>
  );
};
