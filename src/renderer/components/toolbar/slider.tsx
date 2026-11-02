import React from "react";
import { hapticStep, hapticEdge } from "../../shell/haptics";
import { SliderTrack } from "../studio/ui/slider-track/slider-track";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  onDone?: () => void;
  label?: string;
}

export const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange, onDone, label }) => {
  const handleChange = (next: number): void => {
    if (next !== value) {
      if (next <= min || next >= max) hapticEdge();
      else hapticStep();
    }
    onChange(next);
  };

  return (
    <SliderTrack min={min} max={max} step={step} value={value} onChange={handleChange} onCommit={onDone} ariaLabel={label} />
  );
};
