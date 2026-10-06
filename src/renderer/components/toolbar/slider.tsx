import React from "react";
import { hapticStep, hapticEdge } from "../../shell/haptics";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  onDone?: () => void;
}

export const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange, onDone }) => {
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = (next: number): void => {
    if (next !== value) {
      if (next <= min || next >= max) hapticEdge();
      else hapticStep();
    }
    onChange(next);
  };

  return (
    <div className="relative flex items-center h-4 group">
      {/* Track */}
      <div className="absolute w-full h-[3px] rounded-full bg-[var(--s-bg-input)]">
        {/* Fill */}
        <div
          className="absolute h-full rounded-full bg-[var(--s-accent)] transition-none"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb dot */}
        <div
          className="absolute w-2 h-2 rounded-full bg-[var(--s-accent)] -translate-y-1/2 -translate-x-1/2 top-1/2 border border-white/20"
          style={{ left: `${pct}%` }}
        />
      </div>
      {/* Invisible native input for interaction */}
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => handleChange(parseFloat(e.target.value))}
        onMouseUp={onDone}
        onTouchEnd={onDone}
        onKeyUp={onDone}
        className="absolute w-full opacity-0 cursor-pointer h-4"
      />
    </div>
  );
};
