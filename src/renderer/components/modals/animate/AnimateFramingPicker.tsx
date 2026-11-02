import React from "react";
import { useSignalValue } from "../../../lib/signal";
import type { AnimateFraming } from "../../../engine/animate/framing/frame-canvas";
import { animateFramingSignal } from "./animate-framing-store";

interface FramingOption {
  id: AnimateFraming;
  label: string;
}

const FRAMING_OPTIONS: FramingOption[] = [
  { id: "original", label: "original" },
  { id: "spotify-canvas", label: "spotify canvas 9:16" },
];

export const AnimateFramingPicker: React.FC = () => {
  const framing = useSignalValue(animateFramingSignal);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-zinc-400">frame</span>
      {FRAMING_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => {
            animateFramingSignal.value = option.id;
          }}
          className={`px-2 py-0.5 rounded-md text-[11px] border transition-colors ${
            framing === option.id
              ? "border-zinc-600 bg-zinc-800 text-zinc-100"
              : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
