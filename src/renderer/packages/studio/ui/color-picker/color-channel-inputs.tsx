import React from "react";
import { NumberCommitInput } from "../number-commit-input";
import { CHANNEL_SPECS, channelsToHex, hexToChannels, type ChannelMode } from "./color-channels";

interface ColorChannelInputsProps {
  hex6: string;
  mode: ChannelMode;
  onCommit: (hex6: string) => void;
}

export const ColorChannelInputs: React.FC<ColorChannelInputsProps> = ({ hex6, mode, onCommit }) => {
  const values = hexToChannels(hex6, mode);
  const commitChannel = (index: number, next: number): void => {
    const updated = values.map((value, position) => (position === index ? next : value));
    onCommit(channelsToHex(updated, mode));
  };

  return (
    <div className="flex-1 grid grid-cols-3 gap-1">
      {CHANNEL_SPECS[mode].map((spec, index) => (
        <label
          key={spec.label}
          className="h-8 bg-[var(--s-bg-input)] rounded-md flex items-center gap-1 px-2 min-w-0"
        >
          <span className="text-[12px] text-[var(--s-text-subtle)] shrink-0">{spec.label}</span>
          <NumberCommitInput
            value={values[index]}
            min={0}
            max={spec.max}
            onCommit={(next) => commitChannel(index, next)}
            className="w-full min-w-0 bg-transparent border-none text-[12px] text-[var(--s-text)] outline-none font-medium [font-variant-numeric:tabular-nums]"
          />
        </label>
      ))}
    </div>
  );
};
