import React, { memo } from "react";
import { SliderTrack } from "../panel/slider-track/slider-track";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  onDone?: () => void;
  label?: string;
  resetTo?: number;
}

const SliderView: React.FC<SliderProps> = ({ min, max, step, value, onChange, onDone, label, resetTo }) => {
  const track = <SliderTrack min={min} max={max} step={step} value={value} onChange={onChange} onCommit={onDone} ariaLabel={label} />;
  if (resetTo === undefined) return track;
  const reset = (): void => {
    onChange(resetTo);
    onDone?.();
  };
  return (
    <div onDoubleClick={reset} title="Double-click to reset">
      {track}
    </div>
  );
};

export const Slider = memo(SliderView);
