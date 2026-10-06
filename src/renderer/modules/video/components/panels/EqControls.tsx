import React from "react";
import type { AudioEq } from "../../types";
import { SliderRow } from "./effects/SliderRow";
import { EQ_GAIN_RANGE } from "../../engine/audio-eq";

const ZERO_EQ: AudioEq = { low: 0, mid: 0, high: 0 };

interface EqControlsProps {
  eq?: AudioEq;
  onChange: (eq: AudioEq) => void;
}

export const EqControls: React.FC<EqControlsProps> = ({ eq, onChange }) => {
  const value = eq ?? ZERO_EQ;
  const active = value.low !== 0 || value.mid !== 0 || value.high !== 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Equalizer</h4>
        {active && (
          <button
            onClick={() => onChange(ZERO_EQ)}
            className="text-[9px] text-[var(--s-text-subtle)] hover:text-[var(--s-text)] transition-colors"
          >
            reset
          </button>
        )}
      </div>
      <SliderRow
        label="Low"
        min={-EQ_GAIN_RANGE}
        max={EQ_GAIN_RANGE}
        step={1}
        unit="dB"
        value={value.low}
        onChange={(v) => onChange({ ...value, low: v })}
      />
      <SliderRow
        label="Mid"
        min={-EQ_GAIN_RANGE}
        max={EQ_GAIN_RANGE}
        step={1}
        unit="dB"
        value={value.mid}
        onChange={(v) => onChange({ ...value, mid: v })}
      />
      <SliderRow
        label="High"
        min={-EQ_GAIN_RANGE}
        max={EQ_GAIN_RANGE}
        step={1}
        unit="dB"
        value={value.high}
        onChange={(v) => onChange({ ...value, high: v })}
      />
    </div>
  );
};
