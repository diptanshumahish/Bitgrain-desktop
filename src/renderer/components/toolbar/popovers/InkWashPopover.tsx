import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { TransformMode } from "../../../engine/types";
import type { RGB } from "../../../store/transform-store";
import { trackEvent } from "../../../lib/tracker";

interface InkWashPopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  inkwashDetail: number;
  setInkwashDetail: (v: number) => void;
  inkwashBands: number;
  setInkwashBands: (v: number) => void;
  inkwashBleed: number;
  setInkwashBleed: (v: number) => void;
  inkwashInk: RGB;
  setInkwashInk: (v: RGB) => void;
  inkwashPaper: RGB;
  setInkwashPaper: (v: RGB) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

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

export const InkWashPopover: React.FC<InkWashPopoverProps> = ({
  mode,
  onToggle,
  inkwashDetail,
  setInkwashDetail,
  inkwashBands,
  setInkwashBands,
  inkwashBleed,
  setInkwashBleed,
  inkwashInk,
  setInkwashInk,
  inkwashPaper,
  setInkwashPaper,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const isActive = mode.includes("inkwash");

  const colorRow = (
    label: string,
    value: RGB,
    onChange: (v: RGB) => void,
    eventName: string,
  ) => (
    <div className="grid grid-cols-[62px_1fr] items-center gap-2">
      <span className="text-[9px] text-[var(--s-text-subtle)] select-none">{label}</span>
      <input
        type="color"
        value={rgbToHex(value)}
        onChange={(e) => onChange(hexToRgb(e.target.value))}
        onBlur={() => {
          onStateChangeFinished();
          trackEvent("inkwash", eventName, { details: { value } });
        }}
        className="h-6 w-full rounded border border-[var(--s-border)] bg-transparent cursor-pointer"
      />
    </div>
  );

  return (
    <Popover onClose={onClose} className="w-60" static={isStatic}>
      <PopoverSection>
        <div className="flex items-center justify-between px-1 pb-1">
          <div>
            <p className="text-[11px] font-semibold text-[var(--s-text)]">Ink Wash</p>
            <p className="text-[9px] text-[var(--s-text-subtle)] mt-0.5">
              Tonal wash with inked lines
            </p>
          </div>
          <ToggleSwitch checked={isActive} onChange={onToggle} />
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Controls">
        <div
          className={`flex flex-col gap-2.5 px-0.5 pb-0.5 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          <div className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">Line detail</span>
            <Slider
              min={4}
              max={40}
              step={1}
              value={inkwashDetail}
              onChange={setInkwashDetail}
              onDone={() => {
                onStateChangeFinished();
                trackEvent("inkwash", "detail_changed", { details: { value: inkwashDetail } });
              }}
            />
            <EditableValue
              value={inkwashDetail}
              min={4}
              max={40}
              step={1}
              onChange={setInkwashDetail}
              onCommit={() => {
                onStateChangeFinished();
                trackEvent("inkwash", "detail_changed", { details: { value: inkwashDetail } });
              }}
            />
          </div>
          <div className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">Wash tones</span>
            <Slider
              min={2}
              max={10}
              step={1}
              value={inkwashBands}
              onChange={setInkwashBands}
              onDone={() => {
                onStateChangeFinished();
                trackEvent("inkwash", "bands_changed", { details: { value: inkwashBands } });
              }}
            />
            <EditableValue
              value={inkwashBands}
              min={2}
              max={10}
              step={1}
              onChange={setInkwashBands}
              onCommit={() => {
                onStateChangeFinished();
                trackEvent("inkwash", "bands_changed", { details: { value: inkwashBands } });
              }}
            />
          </div>
          <div className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
            <span className="text-[9px] text-[var(--s-text-subtle)] select-none">Bleed</span>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={inkwashBleed}
              onChange={setInkwashBleed}
              onDone={() => {
                onStateChangeFinished();
                trackEvent("inkwash", "bleed_changed", { details: { value: inkwashBleed } });
              }}
            />
            <EditableValue
              value={inkwashBleed}
              min={0}
              max={1}
              step={0.05}
              scale={100}
              suffix="%"
              onChange={setInkwashBleed}
              onCommit={() => {
                onStateChangeFinished();
                trackEvent("inkwash", "bleed_changed", { details: { value: inkwashBleed } });
              }}
            />
          </div>
          {colorRow("Ink", inkwashInk, setInkwashInk, "ink_changed")}
          {colorRow("Paper", inkwashPaper, setInkwashPaper, "paper_changed")}
        </div>
      </PopoverSection>
    </Popover>
  );
};
