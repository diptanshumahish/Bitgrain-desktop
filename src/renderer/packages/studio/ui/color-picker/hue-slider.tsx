import React from "react";

const HUE_MAX = 360;
const PERCENT = 100;

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

export const HueSlider: React.FC<HueSliderProps> = ({ hue, onChange }) => (
  <div className="relative h-4">
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 rounded-full bg-[linear-gradient(to_right,#ff0000_0%,#ffff00_17%,#00ff00_33%,#00ffff_50%,#0000ff_67%,#ff00ff_83%,#ff0000_100%)]" />
    <div
      className="absolute top-1/2 w-4 h-4 rounded-full border-[3px] border-white ring-1 ring-black/25 pointer-events-none -translate-y-1/2 -translate-x-1/2 z-10"
      style={{ left: `${(hue / HUE_MAX) * PERCENT}%` }}
    />
    <input
      type="range"
      min={0}
      max={HUE_MAX}
      step={1}
      value={hue}
      onChange={(event) => onChange(Number(event.target.value))}
      className="absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer z-20"
    />
  </div>
);
