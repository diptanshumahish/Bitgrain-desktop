import React from "react";
import type { TextEffect } from "@bitgrain/studio-core/model/studio-types";
import { ColorPicker } from "../../../../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { TextGlitchFields } from "./text-glitch-fields";
import { GlowFields } from "../glow-fields";

const OFFSET_LIMIT = 60;
const BLUR_MAX = 80;
const OUTLINE_MIN = 1;
const OUTLINE_MAX = 20;
const LIFT_MIN = 1;
const LIFT_MAX = 40;
const PERCENT = 100;

type EffectOf<T extends TextEffect["type"]> = Extract<TextEffect, { type: T }>;

interface FieldsProps<T extends TextEffect["type"]> {
  effect: EffectOf<T>;
  onChange: (effect: TextEffect) => void;
}

const TextShadowFields: React.FC<FieldsProps<"shadow">> = ({ effect, onChange }) => (
  <>
    <div className="grid grid-cols-3 gap-1.5">
      <ScrubField label="X" title="Shadow offset left or right" value={effect.x} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} step={1} onChange={(x) => onChange({ ...effect, x })} />
      <ScrubField label="Y" title="Shadow offset up or down" value={effect.y} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} step={1} onChange={(y) => onChange({ ...effect, y })} />
      <ScrubField label="Blur" title="Shadow softness" value={effect.blur} min={0} max={BLUR_MAX} step={1} onChange={(blur) => onChange({ ...effect, blur })} />
    </div>
    <ColorPicker color={effect.color} onChange={(color) => onChange({ ...effect, color })} />
  </>
);

const TextOutlineFields: React.FC<FieldsProps<"outline">> = ({ effect, onChange }) => (
  <>
    <ScrubField label="Width" title="Outline thickness" value={effect.width} min={OUTLINE_MIN} max={OUTLINE_MAX} step={1} onChange={(width) => onChange({ ...effect, width })} />
    <ColorPicker color={effect.color} onChange={(color) => onChange({ ...effect, color })} />
  </>
);

const TextLiftFields: React.FC<FieldsProps<"lift">> = ({ effect, onChange }) => (
  <div className="grid grid-cols-2 gap-1.5">
    <ScrubField label="Distance" title="How high the text floats" value={effect.distance} min={LIFT_MIN} max={LIFT_MAX} step={1} onChange={(distance) => onChange({ ...effect, distance })} />
    <ScrubField label="Opacity" title="Shadow strength" value={Math.round(effect.opacity * PERCENT)} min={0} max={PERCENT} step={1} onChange={(value) => onChange({ ...effect, opacity: value / PERCENT })} />
  </div>
);

interface TextEffectFieldsProps {
  effect: TextEffect;
  onChange: (effect: TextEffect) => void;
}

export const TextEffectFields: React.FC<TextEffectFieldsProps> = ({ effect, onChange }) => {
  if (effect.type === "shadow") return <TextShadowFields effect={effect} onChange={onChange} />;
  if (effect.type === "outline") return <TextOutlineFields effect={effect} onChange={onChange} />;
  if (effect.type === "lift") return <TextLiftFields effect={effect} onChange={onChange} />;
  if (effect.type === "glow") {
    return <GlowFields size={effect.blur} color={effect.color} onSizeChange={(blur) => onChange({ ...effect, blur })} onColorChange={(color) => onChange({ ...effect, color })} />;
  }
  return <TextGlitchFields effect={effect} onChange={onChange} />;
};
