import React from "react";
import { Popover, PopoverSection } from "@bitgrain/ui/controls/toolbar/Popover";
import type { TransformMode } from "@bitgrain/engine/core/types";
import type { RGB } from "@bitgrain/core/color/rgb";
import { trackEvent } from "@bitgrain/platform/tracker";
import { ToggleRow } from "@bitgrain/ui/controls/toolbar/controls/ToggleRow";
import { LabeledSlider } from "@bitgrain/ui/controls/toolbar/controls/LabeledSlider";
import { ColourField } from "@bitgrain/ui/controls/toolbar/controls/ColourField";
import { rgbToHex } from "@bitgrain/ui/controls/toolbar/controls/rgb-hex";
import { POPART_MAX_CELL, POPART_MIN_CELL } from "@bitgrain/engine/plugins/popart/popart-defaults";

interface PopArtPopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  popartCell: number;
  setPopartCell: (v: number) => void;
  popartAngle: number;
  setPopartAngle: (v: number) => void;
  popartThreshold: number;
  setPopartThreshold: (v: number) => void;
  popartGrain: number;
  setPopartGrain: (v: number) => void;
  popartSpatter: number;
  setPopartSpatter: (v: number) => void;
  popartInk: RGB;
  setPopartInk: (v: RGB) => void;
  popartPaper: RGB;
  setPopartPaper: (v: RGB) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const PERCENT = 100;

const THEMES: { id: string; label: string; ink: RGB; paper: RGB }[] = [
  { id: "comic",  label: "Comic",  ink: [220, 38, 38],  paper: [10, 10, 10]   },
  { id: "noir",   label: "Noir",   ink: [245, 240, 230], paper: [10, 10, 10]  },
  { id: "sun",    label: "Sun",    ink: [250, 204, 21],  paper: [30, 27, 75]  },
  { id: "acid",   label: "Acid",   ink: [34, 197, 94],   paper: [22, 22, 22]  },
  { id: "ink",    label: "Ink",    ink: [22, 22, 22],    paper: [245, 240, 228] },
  { id: "punk",   label: "Punk",   ink: [236, 72, 153],  paper: [12, 10, 30]  },
];

const rgbEq = (a: RGB, b: RGB): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

export const PopArtPopover: React.FC<PopArtPopoverProps> = ({
  mode,
  onToggle,
  popartCell,
  setPopartCell,
  popartAngle,
  setPopartAngle,
  popartThreshold,
  setPopartThreshold,
  popartGrain,
  setPopartGrain,
  popartSpatter,
  setPopartSpatter,
  popartInk,
  setPopartInk,
  popartPaper,
  setPopartPaper,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const isActive = mode.includes("popart");

  const sliderRow = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void,
    suffix: string,
    eventName: string,
  ) => (
    <LabeledSlider
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      decimals={0}
      scale={step < 1 ? PERCENT : undefined}
      suffix={suffix}
      onChange={onChange}
      onCommit={() => {
        onStateChangeFinished();
        trackEvent("popart", eventName, { details: { value } });
      }}
    />
  );

  const swapInkPaper = () => {
    const oldInk = popartInk;
    setPopartInk(popartPaper);
    setPopartPaper(oldInk);
    onStateChangeFinished();
    trackEvent("popart", "swap_colors");
  };

  const commitColour = (eventName: string, value: RGB) => (): void => {
    onStateChangeFinished();
    trackEvent("popart", eventName, { details: { value } });
  };

  return (
    <Popover onClose={onClose} className="w-72" static={isStatic}>
      <PopoverSection>
        <ToggleRow label="Pop art" hint="Halftone with grit" checked={isActive} onChange={onToggle} />
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Theme">
        <div
          className={`grid grid-cols-3 gap-1 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          {THEMES.map((t) => {
            const selected = rgbEq(t.ink, popartInk) && rgbEq(t.paper, popartPaper);
            return (
              <button
                key={t.id}
                onClick={() => {
                  setPopartInk(t.ink);
                  setPopartPaper(t.paper);
                  onStateChangeFinished();
                  trackEvent("popart", "theme_changed", { details: { theme: t.id } });
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[12px] font-medium transition-all ${
                  selected
                    ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-text)]"
                    : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:border-[var(--s-accent)]"
                }`}
              >
                <span className="flex shrink-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                    style={{ background: rgbToHex(t.paper) }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full -ml-1 border border-black/10"
                    style={{ background: rgbToHex(t.ink) }}
                  />
                </span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Custom colours">
        <div
          className={`flex flex-col gap-2 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          <div className="grid grid-cols-2 gap-1.5 px-1">
            <ColourField label="Ink" value={popartInk} onChange={setPopartInk} onCommit={commitColour("ink_changed", popartInk)} />
            <ColourField label="Paper" value={popartPaper} onChange={setPopartPaper} onCommit={commitColour("paper_changed", popartPaper)} />
          </div>
          <button
            onClick={swapInkPaper}
            className="self-start h-7 px-2.5 mx-1 rounded-md border border-[var(--s-border)] text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors"
          >
            Swap ink and paper
          </button>
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Dots and grit">
        <div
          className={`flex flex-col gap-3 pt-1 pb-1 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          {sliderRow("Dot size", popartCell, POPART_MIN_CELL, POPART_MAX_CELL, 1, setPopartCell, "px", "cell_changed")}
          {sliderRow("Angle", popartAngle, 0, 90, 5, setPopartAngle, "°", "angle_changed")}
          {sliderRow("Threshold", popartThreshold, 0.1, 0.9, 0.05, setPopartThreshold, "%", "threshold_changed")}
          {sliderRow("Grain", popartGrain, 0, 1, 0.05, setPopartGrain, "%", "grain_changed")}
          {sliderRow("Spatter", popartSpatter, 0, 1, 0.05, setPopartSpatter, "%", "spatter_changed")}
        </div>
      </PopoverSection>
    </Popover>
  );
};
