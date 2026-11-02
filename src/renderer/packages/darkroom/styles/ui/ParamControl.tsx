import React from "react";
import type { ParamSpec, ParamValue } from "@bitgrain/engine/styles/engine/style-types";
import { LabeledSlider } from "@bitgrain/ui/controls/toolbar/controls/LabeledSlider";
import { ToggleRow } from "@bitgrain/ui/controls/toolbar/controls/ToggleRow";
import { ColourField } from "@bitgrain/ui/controls/toolbar/controls/ColourField";
import { hexToRgb, rgbToHex } from "@bitgrain/ui/controls/toolbar/controls/rgb-hex";
import { ParamSelect } from "./ParamSelect";

interface ParamControlProps {
  spec: ParamSpec;
  value: ParamValue;
  onChange: (value: ParamValue) => void;
  onCommit: () => void;
}

export const ParamControl: React.FC<ParamControlProps> = ({ spec, value, onChange, onCommit }) => {
  if (spec.kind === "number") {
    return (
      <LabeledSlider label={spec.label} value={value as number} min={spec.min} max={spec.max} step={spec.step}
        suffix={spec.suffix} onChange={onChange} onCommit={onCommit} />
    );
  }
  if (spec.kind === "toggle") {
    return (
      <ToggleRow label={spec.label} hint={spec.hint ?? ""} checked={value === true}
        onChange={() => { onChange(value !== true); onCommit(); }} />
    );
  }
  if (spec.kind === "colour") {
    return (
      <div className="px-2">
        <ColourField label={spec.label} value={hexToRgb(value as string)} onChange={(rgb) => onChange(rgbToHex(rgb))} onCommit={onCommit} />
      </div>
    );
  }
  return <ParamSelect spec={spec} value={value as string} onChange={(next) => { onChange(next); onCommit(); }} />;
};
