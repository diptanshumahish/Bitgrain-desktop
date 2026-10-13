import React from "react";
import type { LayerShadow, ShadowMode } from "../../../data/studioTypes";
import { DEFAULT_LAYER_SHADOW } from "../../../data/studioTypes";
import { ScrubField, BtnGroup, Toggle } from "../ui/panelPrimitives";
import { PanelGroup } from "../ui/panel-group";
import { ColorPicker } from "../ui/ColorPicker";

interface ShadowGlowControlsProps {
  shadow?: LayerShadow;
  onChange: (shadow: LayerShadow | undefined) => void;
}

const MODE_OPTIONS = [
  { label: "Shadow", value: "shadow" },
  { label: "Glow", value: "glow" },
];

const SHADOW_RANGE = 100;
const BLUR_MAX = 100;

export const ShadowGlowControls: React.FC<ShadowGlowControlsProps> = ({
  shadow,
  onChange,
}) => {
  const enabled = Boolean(shadow?.enabled);
  const toggle = (
    <Toggle
      value={enabled}
      onChange={(next) => onChange(next ? DEFAULT_LAYER_SHADOW : undefined)}
    />
  );

  if (!shadow || !enabled)
    return <PanelGroup title="Shadow & glow" actions={toggle} />;

  const update = (patch: Partial<LayerShadow>) =>
    onChange({ ...shadow, ...patch });

  return (
    <PanelGroup title="Shadow & glow" actions={toggle}>
      <div className="flex flex-col gap-2">
        <BtnGroup
          options={MODE_OPTIONS}
          value={shadow.mode}
          onChange={(value) => update({ mode: value as ShadowMode })}
        />

        {shadow.mode === "shadow" ? (
          <div className="grid grid-cols-3 gap-1.5">
            <ScrubField
              label="X"
              value={shadow.x}
              min={-SHADOW_RANGE}
              max={SHADOW_RANGE}
              step={1}
              onChange={(value) => update({ x: value })}
            />
            <ScrubField
              label="Y"
              value={shadow.y}
              min={-SHADOW_RANGE}
              max={SHADOW_RANGE}
              step={1}
              onChange={(value) => update({ y: value })}
            />
            <ScrubField
              label="Blur"
              value={shadow.blur}
              min={0}
              max={BLUR_MAX}
              step={1}
              onChange={(value) => update({ blur: value })}
            />
          </div>
        ) : (
          <ScrubField
            label="Size"
            value={shadow.blur}
            min={0}
            max={BLUR_MAX}
            step={1}
            onChange={(value) => update({ blur: value })}
          />
        )}

        <ColorPicker
          color={shadow.color}
          onChange={(color) => update({ color })}
        />
      </div>
    </PanelGroup>
  );
};
