import React from "react";
import { Slider } from "../../slider";
import { HalftoneLabel } from "./HalftoneLabel";

interface HalftoneSliderRowProps {
  label: string;
  tip: string;
  min: number;
  max: number;
  step: number;
  value: number;
  readout: string;
  onChange: (value: number) => void;
  onDone: () => void;
}

export const HalftoneSliderRow: React.FC<HalftoneSliderRowProps> = ({
  label,
  tip,
  min,
  max,
  step,
  value,
  readout,
  onChange,
  onDone,
}) => (
  <div className="grid grid-cols-[76px_1fr_52px] items-center gap-2">
    <HalftoneLabel text={label} tip={tip} />
    <Slider label={label} min={min} max={max} step={step} value={value} onChange={onChange} onDone={onDone} />
    <span className="text-[12px] text-right tabular-nums text-[var(--s-text-muted)]">{readout}</span>
  </div>
);
