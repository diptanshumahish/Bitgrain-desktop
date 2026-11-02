import React from "react";
import { Slider } from "../../../../components/studio/ui/slider";
import type { LuminanceRange } from "../../mask/mask-types";
import { ToggleRow } from "./toggle-row";

interface LuminanceRangeControlsProps {
  range: LuminanceRange;
  onChange: (range: LuminanceRange) => void;
  onCommit?: () => void;
}

const PERCENT_MAX = 100;

export const LuminanceRangeControls: React.FC<LuminanceRangeControlsProps> = ({ range, onChange, onCommit }) => (
  <div className="flex flex-col gap-2.5">
    <ToggleRow
      label="by brightness"
      value={range.enabled}
      onChange={(enabled) => {
        onChange({ ...range, enabled });
        onCommit?.();
      }}
    />
    {range.enabled && (
      <>
        <Slider label="from" value={range.min} max={PERCENT_MAX} suffix="%" onChange={(min) => onChange({ ...range, min })} onCommit={onCommit} />
        <Slider label="to" value={range.max} max={PERCENT_MAX} suffix="%" onChange={(max) => onChange({ ...range, max })} onCommit={onCommit} />
        <Slider label="softness" value={range.softness} max={PERCENT_MAX} onChange={(softness) => onChange({ ...range, softness })} onCommit={onCommit} />
      </>
    )}
  </div>
);
