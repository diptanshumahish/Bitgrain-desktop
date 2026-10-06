import React, { useEffect, useRef, useState } from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { TransformMode } from "../../../engine/types";

interface HazeBloomPopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  hazeIntensity: number;
  setHazeIntensity: (v: number) => void;
  bloomIntensity: number;
  setBloomIntensity: (v: number) => void;
  bloomThreshold: number;
  setBloomThreshold: (v: number) => void;
  hazeWarmth: number;
  setHazeWarmth: (v: number) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (v: number) => void;
  onDone: () => void;
  display?: string;
  suffix?: string;
  scale?: number;
  decimals?: number;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, disabled, onChange, onDone, display, suffix, scale, decimals }) => {
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tipRef.current) clearTimeout(tipRef.current);
    };
  }, []);

  const handleDisabledClick = () => {
    setShowTip(true);
    if (tipRef.current) clearTimeout(tipRef.current);
    tipRef.current = setTimeout(() => setShowTip(false), 2000);
  };

  return (
    <div className="relative grid grid-cols-[62px_1fr_40px] items-center gap-2">
      <span className={`text-[9px] select-none transition-opacity ${disabled ? "opacity-35" : "text-[var(--s-text-subtle)]"}`}>{label}</span>
      <div className="relative" onClick={disabled ? handleDisabledClick : undefined}>
        <Slider min={min} max={max} step={step} value={value} onChange={disabled ? () => {} : onChange} onDone={disabled ? () => {} : onDone} />
        {disabled && <div className="absolute inset-0 cursor-not-allowed" />}
        {showTip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-[10px] font-medium rounded-md whitespace-nowrap pointer-events-none z-10">
            Enable haze & bloom first
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
          </div>
        )}
      </div>
      {suffix !== undefined ? (
        <EditableValue
          className={`text-[9px] text-[var(--s-text-subtle)] ${disabled ? "opacity-35" : ""}`}
          value={value}
          min={min}
          max={max}
          step={step}
          suffix={suffix}
          scale={scale}
          decimals={decimals}
          disabled={disabled}
          onChange={onChange}
          onCommit={onDone}
        />
      ) : (
        <span className={`text-[9px] text-right tabular-nums select-none transition-opacity ${disabled ? "opacity-35" : "text-[var(--s-text-subtle)]"}`}>{display}</span>
      )}
    </div>
  );
};

function warmthLabel(v: number): string {
  if (v < 0.35) return "cool";
  if (v > 0.65) return "warm";
  return "neutral";
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
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

export const HazeBloomPopover: React.FC<HazeBloomPopoverProps> = ({
  mode,
  onToggle,
  hazeIntensity,
  setHazeIntensity,
  bloomIntensity,
  setBloomIntensity,
  bloomThreshold,
  setBloomThreshold,
  hazeWarmth,
  setHazeWarmth,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const isActive = mode.includes("haze-bloom");

  return (
    <Popover onClose={onClose} className="w-56" static={isStatic}>
      <PopoverSection>
        <div className="flex items-center justify-between px-1 pb-1">
          <div>
            <p className="text-[11px] font-semibold text-[var(--s-text)]">Haze & Bloom</p>
            <p className="text-[9px] text-[var(--s-text-subtle)] mt-0.5">Film optical diffusion</p>
          </div>
          <ToggleSwitch checked={isActive} onChange={onToggle} />
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Haze">
        <div className={`flex flex-col gap-2.5 px-0.5 pb-0.5 transition-opacity ${!isActive ? "opacity-50" : ""}`}>
          <SliderRow
            label="Intensity"
            value={hazeIntensity}
            min={0} max={1} step={0.05}
            scale={100} suffix="%"
            disabled={!isActive}
            onChange={setHazeIntensity}
            onDone={onStateChangeFinished}
          />
          <SliderRow
            label="Warmth"
            value={hazeWarmth}
            min={0} max={1} step={0.05}
            display={warmthLabel(hazeWarmth)}
            disabled={!isActive}
            onChange={setHazeWarmth}
            onDone={onStateChangeFinished}
          />
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Bloom">
        <div className={`flex flex-col gap-2.5 px-0.5 pb-0.5 transition-opacity ${!isActive ? "opacity-50" : ""}`}>
          <SliderRow
            label="Intensity"
            value={bloomIntensity}
            min={0} max={1} step={0.05}
            scale={100} suffix="%"
            disabled={!isActive}
            onChange={setBloomIntensity}
            onDone={onStateChangeFinished}
          />
          <SliderRow
            label="Threshold"
            value={bloomThreshold}
            min={0.3} max={1} step={0.05}
            scale={100} suffix="%"
            disabled={!isActive}
            onChange={setBloomThreshold}
            onDone={onStateChangeFinished}
          />
        </div>
      </PopoverSection>
    </Popover>
  );
};
