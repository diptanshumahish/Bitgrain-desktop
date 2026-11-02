import React from "react";
import { Circle, Blend } from "lucide-react";
import type { BlendMode } from "@bitgrain/studio-core/model/studio-types";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { BLEND_MODE_OPTIONS, BLEND_MODE_HINT } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";

interface AppearanceControlsProps {
  opacity: number;
  blendMode?: BlendMode;
  onOpacityChange: (value: number) => void;
  onBlendModeChange: (mode: BlendMode) => void;
}

const PERCENT = 100;

export const AppearanceControls: React.FC<AppearanceControlsProps> = ({
  opacity,
  blendMode,
  onOpacityChange,
  onBlendModeChange,
}) => (
  <div className="grid grid-cols-2 gap-2">
    <ScrubField
      label={<Circle size={12} strokeWidth={1.75} />}
      title="Layer opacity"
      value={Math.round(opacity * PERCENT)}
      min={0}
      max={PERCENT}
      suffix="%"
      onChange={(value) => onOpacityChange(value / PERCENT)}
    />
    <Dropdown
      icon={<Blend size={13} strokeWidth={1.75} />}
      options={BLEND_MODE_OPTIONS}
      title={BLEND_MODE_HINT}
      value={blendMode ?? "normal"}
      onChange={(value) => onBlendModeChange(value as BlendMode)}
    />
  </div>
);
