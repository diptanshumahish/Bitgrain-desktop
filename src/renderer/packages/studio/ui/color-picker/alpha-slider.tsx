import React from "react";
import { ALPHA_MAX } from "./color-alpha";

interface AlphaSliderProps {
  alpha: number;
  hex6: string;
  onChange: (alpha: number) => void;
}

export const AlphaSlider: React.FC<AlphaSliderProps> = ({ alpha, hex6, onChange }) => (
  <div className="relative h-4">
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 rounded-full overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,#666_25%,transparent_25%),linear-gradient(-45deg,#666_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#666_75%),linear-gradient(-45deg,transparent_75%,#666_75%)] bg-[length:6px_6px] bg-[position:0_0,0_3px,3px_-3px,-3px_0px]" />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to right, transparent, ${hex6})` }}
      />
    </div>
    <div
      className="absolute top-1/2 w-4 h-4 rounded-full border-[3px] border-white ring-1 ring-black/25 pointer-events-none -translate-y-1/2 -translate-x-1/2 z-10"
      style={{ left: `${alpha}%` }}
    />
    <input
      type="range"
      min={0}
      max={ALPHA_MAX}
      step={1}
      value={alpha}
      onChange={(event) => onChange(Number(event.target.value))}
      className="absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer z-20"
    />
  </div>
);
