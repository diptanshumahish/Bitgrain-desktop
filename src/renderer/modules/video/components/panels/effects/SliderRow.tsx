import React from "react";

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const SliderRow: React.FC<SliderRowProps> = ({
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-[var(--s-text-muted)] truncate">{label}</span>
      <span className="shrink-0 rounded bg-[var(--s-bg-input)] px-1.5 py-0.5 text-[10px] text-[var(--s-text)] tabular-nums">
        {Number.isInteger(value) ? value : value.toFixed(2)}
        {unit ?? ""}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="studio-slider w-full"
    />
  </div>
);
