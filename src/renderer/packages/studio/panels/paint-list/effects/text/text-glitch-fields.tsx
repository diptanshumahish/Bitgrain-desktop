import React from "react";
import type { TextEffect } from "@bitgrain/studio-core/model/studio-types";
import { ColorPicker } from "../../../../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";

const GLITCH_MAX = 20;
const GLITCH_STEP = 0.5;

interface TextGlitchFieldsProps {
  effect: Extract<TextEffect, { type: "glitch" }>;
  onChange: (effect: TextEffect) => void;
}

export const TextGlitchFields: React.FC<TextGlitchFieldsProps> = ({ effect, onChange }) => (
  <>
    <div className="grid grid-cols-2 gap-1.5">
      <ScrubField label="X" title="Split left or right" value={effect.offsetX} min={0} max={GLITCH_MAX} step={GLITCH_STEP} onChange={(offsetX) => onChange({ ...effect, offsetX })} />
      <ScrubField label="Y" title="Split up or down" value={effect.offsetY} min={0} max={GLITCH_MAX} step={GLITCH_STEP} onChange={(offsetY) => onChange({ ...effect, offsetY })} />
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      <ColorPicker color={effect.color1} label="Color 1" onChange={(color1) => onChange({ ...effect, color1 })} />
      <ColorPicker color={effect.color2} label="Color 2" onChange={(color2) => onChange({ ...effect, color2 })} />
    </div>
  </>
);
