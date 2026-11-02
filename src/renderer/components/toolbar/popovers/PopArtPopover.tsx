import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { TransformMode } from "../../../engine/types";
import type { RGB } from "../../../store/transform-store";
import { trackEvent } from "../../../lib/tracker";
import { ToggleSwitch } from "../controls/ToggleSwitch";
import { POPART_MAX_CELL, POPART_MIN_CELL } from "../../../engine/plugins/popart/popart-defaults";

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

const THEMES: { id: string; label: string; ink: RGB; paper: RGB }[] = [
  { id: "comic",  label: "Comic",  ink: [220, 38, 38],  paper: [10, 10, 10]   },
  { id: "noir",   label: "Noir",   ink: [245, 240, 230], paper: [10, 10, 10]  },
  { id: "sun",    label: "Sun",    ink: [250, 204, 21],  paper: [30, 27, 75]  },
  { id: "acid",   label: "Acid",   ink: [34, 197, 94],   paper: [22, 22, 22]  },
  { id: "ink",    label: "Ink",    ink: [22, 22, 22],    paper: [245, 240, 228] },
  { id: "punk",   label: "Punk",   ink: [236, 72, 153],  paper: [12, 10, 30]  },
];

const rgbToHex = ([r, g, b]: RGB): string =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

const hexToRgb = (hex: string): RGB => {
  const m = hex.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16) || 0,
    parseInt(m.slice(2, 4), 16) || 0,
    parseInt(m.slice(4, 6), 16) || 0,
  ];
};

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
    <div className="grid grid-cols-[84px_1fr_44px] items-center gap-2">
      <span className="text-[12px] text-[var(--s-text-subtle)] select-none">
        {label}
      </span>
      <Slider
        label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        onDone={() => {
          onStateChangeFinished();
          trackEvent("popart", eventName, { details: { value } });
        }}
      />
      <EditableValue
        value={value}
        min={min}
        max={max}
        step={step}
        decimals={step < 1 ? 2 : 0}
        suffix={suffix}
        onChange={onChange}
        onCommit={() => {
          onStateChangeFinished();
          trackEvent("popart", eventName, { details: { value } });
        }}
      />
    </div>
  );

  const swapInkPaper = () => {
    const oldInk = popartInk;
    setPopartInk(popartPaper);
    setPopartPaper(oldInk);
    onStateChangeFinished();
    trackEvent("popart", "swap_colors");
  };

  const colorRow = (
    label: string,
    value: RGB,
    onChange: (v: RGB) => void,
    eventName: string,
  ) => (
    <div className="grid grid-cols-[84px_1fr_44px] items-center gap-2">
      <span className="text-[12px] text-[var(--s-text-subtle)] select-none">
        {label}
      </span>
      <input
        type="color"
        value={rgbToHex(value)}
        onChange={(e) => onChange(hexToRgb(e.target.value))}
        onBlur={() => {
          onStateChangeFinished();
          trackEvent("popart", eventName, { details: { value } });
        }}
        className="h-6 w-full rounded border border-[var(--s-border)] bg-transparent cursor-pointer"
      />
      <span className="text-[12px] text-right tabular-nums text-[var(--s-text-subtle)] select-none">
        {rgbToHex(value)}
      </span>
    </div>
  );

  return (
    <Popover onClose={onClose} className="w-72" static={isStatic}>
      <PopoverSection>
        <div className="flex items-center justify-between px-1 pb-1">
          <div>
            <p className="text-[12px] font-semibold text-[var(--s-text)]">
              Pop Grunge
            </p>
            <p className="text-[12px] text-[var(--s-text-subtle)] mt-0.5">
              Halftone with grit
            </p>
          </div>
          <ToggleSwitch checked={isActive} onChange={onToggle} label="Pop art" />
        </div>
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

      <PopoverSection title="Custom Colors">
        <div
          className={`flex flex-col gap-2 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          {colorRow("Ink", popartInk, setPopartInk, "ink_changed")}
          {colorRow("Paper", popartPaper, setPopartPaper, "paper_changed")}
          <button
            onClick={swapInkPaper}
            className="text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-accent)] self-start px-1"
          >
            ⇄ swap ink + paper
          </button>
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Controls">
        <div
          className={`flex flex-col gap-2.5 px-0.5 pb-0.5 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          {sliderRow("Dot size", popartCell, POPART_MIN_CELL, POPART_MAX_CELL, 1, setPopartCell, "px", "cell_changed")}
          {sliderRow("Angle", popartAngle, 0, 90, 5, setPopartAngle, "°", "angle_changed")}
          {sliderRow("Threshold", popartThreshold, 0.1, 0.9, 0.05, setPopartThreshold, "", "threshold_changed")}
          {sliderRow("Grain", popartGrain, 0, 1, 0.05, setPopartGrain, "", "grain_changed")}
          {sliderRow("Spatter", popartSpatter, 0, 1, 0.05, setPopartSpatter, "", "spatter_changed")}
        </div>
      </PopoverSection>
    </Popover>
  );
};
