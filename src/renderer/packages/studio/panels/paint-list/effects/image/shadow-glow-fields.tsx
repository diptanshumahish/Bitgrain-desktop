import React from "react";
import type { LayerShadow } from "@bitgrain/studio-core/model/studio-types";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { ColorPicker } from "../../../../ui/ColorPicker";
import { GlowFields } from "../glow-fields";

interface ShadowGlowFieldsProps {
  shadow: LayerShadow;
  onChange: (shadow: LayerShadow) => void;
}

const SHADOW_RANGE = 100;
const BLUR_MAX = 100;

export const ShadowGlowFields: React.FC<ShadowGlowFieldsProps> = ({ shadow, onChange }) => {
  const update = (patch: Partial<LayerShadow>): void => onChange({ ...shadow, ...patch });
  if (shadow.mode === "glow") {
    return <GlowFields size={shadow.blur} color={shadow.color} onSizeChange={(blur) => update({ blur })} onColorChange={(color) => update({ color })} />;
  }
  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        <ScrubField label="X" title="Shadow offset left or right" value={shadow.x} min={-SHADOW_RANGE} max={SHADOW_RANGE} step={1} onChange={(x) => update({ x })} />
        <ScrubField label="Y" title="Shadow offset up or down" value={shadow.y} min={-SHADOW_RANGE} max={SHADOW_RANGE} step={1} onChange={(y) => update({ y })} />
        <ScrubField label="Blur" title="Shadow softness" value={shadow.blur} min={0} max={BLUR_MAX} step={1} onChange={(blur) => update({ blur })} />
      </div>
      <ColorPicker color={shadow.color} onChange={(color) => update({ color })} />
    </>
  );
};
