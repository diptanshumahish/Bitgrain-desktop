import React from "react";
import { Slider } from "../../studio/ui/slider";
import type { SmartObjectSettings } from "../../../engine/mockup/mockup-types";

const PERCENT = 100;
const MAX_DISPLACEMENT_RADIUS = 16;
const MAX_SOFTNESS = 4;
const MAX_GRAIN = 40;

interface SmartObjectControlsProps {
  settings: SmartObjectSettings;
  dark: boolean;
  onChange: (settings: SmartObjectSettings) => void;
}

export const SmartObjectControls: React.FC<SmartObjectControlsProps> = ({ settings, dark, onChange }) => {
  const update = (patch: Partial<SmartObjectSettings>): void => onChange({ ...settings, ...patch });

  const toggleIdle = dark ? "border-white/10 text-zinc-400" : "border-zinc-200 text-zinc-600";
  const toggleActive = dark ? "border-[#820000] text-white" : "border-[#820000] text-zinc-900";

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => update({ preserveAspect: !settings.preserveAspect })}
        title="fit the artwork inside the corners without stretching it"
        className={`flex items-center justify-between h-9 px-2.5 rounded-lg border text-[12px] ${settings.preserveAspect ? toggleActive : toggleIdle}`}
      >
        <span>keep artwork proportions</span>
        <span>{settings.preserveAspect ? "on" : "off"}</span>
      </button>
      <Slider
        label="surface shading"
        value={Math.round(settings.shading * PERCENT)}
        onChange={(value) => update({ shading: value / PERCENT })}
        suffix="%"
      />
      <Slider
        label="ink opacity"
        value={Math.round(settings.opacity * PERCENT)}
        onChange={(value) => update({ opacity: value / PERCENT })}
        suffix="%"
      />
      <Slider
        label="surface follow"
        value={Math.round(settings.displacement * PERCENT)}
        onChange={(value) => update({ displacement: value / PERCENT })}
        suffix="%"
      />
      <Slider
        label="follow detail"
        value={settings.displacementRadius}
        onChange={(value) => update({ displacementRadius: value })}
        min={1}
        max={MAX_DISPLACEMENT_RADIUS}
      />
      <Slider
        label="edge bleed"
        value={settings.softness}
        onChange={(value) => update({ softness: value })}
        min={0}
        max={MAX_SOFTNESS}
        step={0.25}
        decimals={2}
      />
      <Slider
        label="grain"
        value={Math.round(settings.grain * PERCENT)}
        onChange={(value) => update({ grain: value / PERCENT })}
        min={0}
        max={MAX_GRAIN}
        suffix="%"
      />
    </div>
  );
};
