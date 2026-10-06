import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { TransformMode } from "../../../engine/types";
import { trackEvent } from "../../../lib/tracker";

interface HalftonePopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  halftoneCell: number;
  setHalftoneCell: (v: number) => void;
  halftoneAngle: number;
  setHalftoneAngle: (v: number) => void;
  halftoneStyle: "mono" | "color" | "cmyk";
  setHalftoneStyle: (v: "mono" | "color" | "cmyk") => void;
  halftoneShape: "round" | "square";
  setHalftoneShape: (v: "round" | "square") => void;
  halftoneInvert: boolean;
  setHalftoneInvert: (v: boolean) => void;
  halftoneIntensity: number;
  setHalftoneIntensity: (v: number) => void;
  halftoneSharpness: number;
  setHalftoneSharpness: (v: number) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const SHAPES: { id: "round" | "square"; label: string }[] = [
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
];

const STYLES: {
  id: "mono" | "color" | "cmyk";
  label: string;
  desc: string;
  glyph: string;
}[] = [
  { id: "mono", label: "Mono", desc: "B&W dot screen", glyph: "⬛·⬛·" },
  { id: "color", label: "Colour", desc: "Colour dot screen", glyph: "🔴🟢🔵" },
  { id: "cmyk", label: "CMYK", desc: "Print-style offset", glyph: "◉◎◑◐" },
];

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <button
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      checked ? "bg-[var(--s-accent)]" : "bg-[var(--s-bg-input)]"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white transform transition-transform duration-200 ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

export const HalftonePopover: React.FC<HalftonePopoverProps> = ({
  mode,
  onToggle,
  halftoneCell,
  setHalftoneCell,
  halftoneAngle,
  setHalftoneAngle,
  halftoneStyle,
  setHalftoneStyle,
  halftoneShape,
  setHalftoneShape,
  halftoneInvert,
  setHalftoneInvert,
  halftoneIntensity,
  setHalftoneIntensity,
  halftoneSharpness,
  setHalftoneSharpness,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const isActive = mode.includes("halftone");

  return (
    <Popover onClose={onClose} className="w-60" static={isStatic}>
      {/* ── Header ── */}
      <PopoverSection>
        <div className="flex items-center justify-between px-1 pb-1">
          <div>
            <p className="text-[11px] font-semibold text-[var(--s-text)]">
              Halftone
            </p>
            <p className="text-[9px] text-[var(--s-text-subtle)] mt-0.5">
              Dot-screen print effect
            </p>
          </div>
          <ToggleSwitch checked={isActive} onChange={onToggle} />
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      {/* ── Style selector ── */}
      <PopoverSection title="Screen Style">
        <div
          className={`flex flex-col gap-1 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setHalftoneStyle(s.id);
                onStateChangeFinished();
                trackEvent("halftone", "style_changed", { details: { style: s.id } });
              }}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                halftoneStyle === s.id
                  ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                  : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
              }`}
            >
              <span>{s.label}</span>
              <span
                className={`text-[9px]   shrink-0 ml-1 ${halftoneStyle === s.id ? "opacity-80" : "text-[var(--s-text-subtle)]"}`}
              >
                {s.glyph}
              </span>
            </button>
          ))}
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      {/* ── Sliders ── */}
      <PopoverSection title="Controls">
        <div
          className={`flex flex-col gap-2.5 px-0.5 pb-0.5 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          <div className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">
              Cell size
            </span>
            <Slider
              min={1}
              max={32}
              step={1}
              value={halftoneCell}
              onChange={setHalftoneCell}
              onDone={() => {
                onStateChangeFinished();
                trackEvent("halftone", "cell_size_changed", { details: { value: halftoneCell } });
              }}
            />
            <EditableValue
              value={halftoneCell}
              min={1}
              max={32}
              step={1}
              suffix="px"
              onChange={setHalftoneCell}
              onCommit={() => {
                onStateChangeFinished();
                trackEvent("halftone", "cell_size_changed", { details: { value: halftoneCell } });
              }}
            />
          </div>
          <div className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">
              Intensity
            </span>
            <Slider
              min={0.1}
              max={3}
              step={0.1}
              value={halftoneIntensity}
              onChange={setHalftoneIntensity}
              onDone={() => {
                onStateChangeFinished();
                trackEvent("halftone", "intensity_changed", { details: { value: halftoneIntensity } });
              }}
            />
            <EditableValue
              value={halftoneIntensity}
              min={0.1}
              max={3}
              step={0.1}
              decimals={1}
              suffix="×"
              onChange={setHalftoneIntensity}
              onCommit={() => {
                onStateChangeFinished();
                trackEvent("halftone", "intensity_changed", { details: { value: halftoneIntensity } });
              }}
            />
          </div>
          <div className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">
              Sharpness
            </span>
            <Slider
              min={0}
              max={100}
              step={1}
              value={halftoneSharpness}
              onChange={setHalftoneSharpness}
              onDone={() => {
                onStateChangeFinished();
                trackEvent("halftone", "sharpness_changed", { details: { value: halftoneSharpness } });
              }}
            />
            <EditableValue
              value={halftoneSharpness}
              min={0}
              max={100}
              step={1}
              onChange={setHalftoneSharpness}
              onCommit={() => {
                onStateChangeFinished();
                trackEvent("halftone", "sharpness_changed", { details: { value: halftoneSharpness } });
              }}
            />
          </div>
          <div className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">
              Angle
            </span>
            <Slider
              min={0}
              max={90}
              step={5}
              value={halftoneAngle}
              onChange={setHalftoneAngle}
              onDone={() => {
                onStateChangeFinished();
                trackEvent("halftone", "angle_changed", { details: { value: halftoneAngle } });
              }}
            />
            <EditableValue
              value={halftoneAngle}
              min={0}
              max={90}
              step={5}
              suffix="°"
              onChange={setHalftoneAngle}
              onCommit={() => {
                onStateChangeFinished();
                trackEvent("halftone", "angle_changed", { details: { value: halftoneAngle } });
              }}
            />
          </div>
          <div className="grid grid-cols-[62px_1fr] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">
              Dot shape
            </span>
            <div className="flex items-center gap-1">
              {SHAPES.map((shapeOption) => (
                <button
                  key={shapeOption.id}
                  onClick={() => {
                    setHalftoneShape(shapeOption.id);
                    onStateChangeFinished();
                    trackEvent("halftone", "shape_changed", { details: { shape: shapeOption.id } });
                  }}
                  className={`flex-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                    halftoneShape === shapeOption.id
                      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                      : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
                  }`}
                >
                  {shapeOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      {/* ── Invert toggle ── */}
      <PopoverSection>
        <div
          className={`flex items-center justify-between px-1 py-0.5 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          <div>
            <p className="text-[10px] font-medium text-[var(--s-text)]">
              Invert ink
            </p>
            <p className="text-[9px] text-[var(--s-text-subtle)]">
              Dark dots on white bg
            </p>
          </div>
          <ToggleSwitch
            checked={halftoneInvert}
            onChange={() => {
              const newVal = !halftoneInvert;
              setHalftoneInvert(newVal);
              onStateChangeFinished();
              trackEvent("halftone", "invert_toggled", { details: { enabled: newVal } });
            }}
          />
        </div>
      </PopoverSection>
    </Popover>
  );
};
