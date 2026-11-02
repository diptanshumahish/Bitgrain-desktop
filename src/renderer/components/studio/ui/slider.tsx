import React from "react";
import { ScrubField } from "./panelPrimitives";
import { SliderTrack } from "./slider-track/slider-track";

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onCommit?: () => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  decimals?: number;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  onCommit,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
  suffix,
  decimals,
  disabled,
}) => (
  <div className={`flex flex-col gap-1.5 ${disabled ? "opacity-35 pointer-events-none" : ""}`}>
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">{label}</span>
      <ScrubField
        compact
        label={null}
        value={value}
        min={min}
        max={max}
        step={step}
        suffix={suffix}
        decimals={decimals}
        disabled={disabled}
        onChange={onChange}
        onCommit={onCommit}
      />
    </div>
    <SliderTrack
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      onCommit={onCommit}
      disabled={disabled}
      ariaLabel={label}
    />
  </div>
);
