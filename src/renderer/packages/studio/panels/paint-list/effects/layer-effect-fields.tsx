import React from "react";
import type { LayerEffect, LayerEffectKind } from "@bitgrain/studio-core/model/layer-paint-types";
import { ColorPicker } from "../../../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { GlowFields } from "./glow-fields";

const OFFSET_LIMIT = 200;
const MAX_BLUR = 200;
const SPREAD_LIMIT = 100;

interface LayerEffectFieldsProps {
  effect: LayerEffect;
  onChange: (effect: LayerEffect) => void;
}

const isShadow = (kind: LayerEffectKind): boolean => kind === "drop-shadow" || kind === "inner-shadow";

const ShadowFields: React.FC<LayerEffectFieldsProps> = ({ effect, onChange }) => (
  <>
    <div className="grid grid-cols-2 gap-2">
      <ScrubField label="X" title="Shadow offset left or right" value={effect.x} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} onChange={(x) => onChange({ ...effect, x })} />
      <ScrubField label="Y" title="Shadow offset up or down" value={effect.y} min={-OFFSET_LIMIT} max={OFFSET_LIMIT} onChange={(y) => onChange({ ...effect, y })} />
      <ScrubField label="Blur" title="Shadow softness" value={effect.blur} min={0} max={MAX_BLUR} onChange={(blur) => onChange({ ...effect, blur })} />
      <ScrubField label="Spread" title="Grow or shrink the shadow" value={effect.spread} min={-SPREAD_LIMIT} max={SPREAD_LIMIT} onChange={(spread) => onChange({ ...effect, spread })} />
    </div>
    <ColorPicker color={effect.color} onChange={(color) => onChange({ ...effect, color })} />
  </>
);

export const LayerEffectFields: React.FC<LayerEffectFieldsProps> = ({ effect, onChange }) => {
  if (isShadow(effect.kind)) return <ShadowFields effect={effect} onChange={onChange} />;
  if (effect.kind === "glow") {
    return (
      <GlowFields
        size={effect.blur}
        color={effect.color}
        onSizeChange={(blur) => onChange({ ...effect, blur })}
        onColorChange={(color) => onChange({ ...effect, color })}
      />
    );
  }
  return <ScrubField label="Amount" title="Blur strength" value={effect.blur} min={0} max={MAX_BLUR} onChange={(blur) => onChange({ ...effect, blur })} />;
};
