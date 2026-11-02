import React, { memo } from "react";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";

interface LabeledSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onCommit: () => void;
  suffix?: string;
  scale?: number;
  decimals?: number;
}

const LabeledSliderView: React.FC<LabeledSliderProps> = ({ label, value, min, max, step, onChange, onCommit, suffix, scale, decimals }) => (
  <div className="grid grid-cols-[80px_1fr_44px] items-center gap-2 px-2">
    <span className="text-[12px] text-[var(--s-text-muted)] select-none">{label}</span>
    <Slider label={label} min={min} max={max} step={step} value={value} onChange={onChange} onDone={onCommit} />
    <EditableValue value={value} min={min} max={max} step={step} scale={scale} decimals={decimals} suffix={suffix} onChange={onChange} onCommit={onCommit} />
  </div>
);

export const LabeledSlider = memo(LabeledSliderView);
