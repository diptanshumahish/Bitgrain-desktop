import React from "react";
import { Minus } from "lucide-react";
import type { LayerShadow, ShadowMode } from "../../../data/studioTypes";
import { DEFAULT_LAYER_SHADOW } from "../../../data/studioTypes";
import { ScrubField, BtnGroup } from "../ui/panelPrimitives";
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
  if (!shadow?.enabled) {
    return (
      <button
        type="button"
        onClick={() => onChange(DEFAULT_LAYER_SHADOW)}
        className="w-full h-9 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] text-[11.5px] text-[var(--s-text)] font-editorial cursor-pointer hover:border-[var(--s-accent)] transition-colors"
      >
        Add shadow or glow
      </button>
    );
  }

  const update = (patch: Partial<LayerShadow>) => onChange({ ...shadow, ...patch });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <BtnGroup
            options={MODE_OPTIONS}
            value={shadow.mode}
            onChange={(value) => update({ mode: value as ShadowMode })}
          />
        </div>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="w-6 h-6 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center text-[var(--s-text-subtle)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Minus size={12} strokeWidth={1.5} />
        </button>
      </div>

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
  );
};
