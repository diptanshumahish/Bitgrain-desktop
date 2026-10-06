import React from "react";
import { Zap } from "lucide-react";
import type { OverlayEffect, OverlayEffectKind } from "../../types";
import {
  OVERLAY_EFFECTS,
  OVERLAY_EFFECT_KINDS,
  defaultOverlayEffect,
} from "../../engine/overlay-effects/registry";
import { SelectMenu } from "../ui/SelectMenu";
import { SliderRow } from "./effects/SliderRow";

const NONE_VALUE = "none";

interface ImageEffectSectionProps {
  effect: OverlayEffect | undefined;
  onChange: (effect: OverlayEffect | undefined) => void;
}

const options = [
  { value: NONE_VALUE, label: "None", glyph: "—" },
  ...OVERLAY_EFFECT_KINDS.map((kind) => ({
    value: kind,
    label: OVERLAY_EFFECTS[kind].label,
    glyph: OVERLAY_EFFECTS[kind].glyph,
  })),
];

export const ImageEffectSection: React.FC<ImageEffectSectionProps> = ({
  effect,
  onChange,
}) => {
  const def = effect ? OVERLAY_EFFECTS[effect.kind] : null;

  const handleKind = (value: string): void => {
    if (value === NONE_VALUE) {
      onChange(undefined);
      return;
    }
    onChange(defaultOverlayEffect(value as OverlayEffectKind));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Zap size={12} className="text-[var(--s-text-subtle)]" />
        <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Glitch & distortion</h4>
      </div>
      <SelectMenu
        value={effect?.kind ?? NONE_VALUE}
        options={options}
        onChange={handleKind}
        ariaLabel="Overlay effect"
        className="w-full"
      />
      {effect && def && (
        <>
          <SliderRow
            label="Intensity"
            min={0}
            max={100}
            step={1}
            unit="%"
            value={Math.round(effect.intensity * 100)}
            onChange={(v) => onChange({ ...effect, intensity: v / 100 })}
          />
          {def.animated && (
            <SliderRow
              label="Speed"
              min={0}
              max={100}
              step={1}
              unit="%"
              value={Math.round(effect.speed * 100)}
              onChange={(v) => onChange({ ...effect, speed: v / 100 })}
            />
          )}
        </>
      )}
    </div>
  );
};
