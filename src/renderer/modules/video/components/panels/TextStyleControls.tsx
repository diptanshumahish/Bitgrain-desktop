import React from "react";
import type { TextClip, TextShadow, TextStroke } from "../../types";
import { SliderRow } from "./effects/SliderRow";
import { Toggle } from "./effects/filter-shared";

const DEFAULT_SHADOW: TextShadow = {
  enabled: true,
  color: "#000000",
  blur: 6,
  offsetX: 0,
  offsetY: 4,
};

const DEFAULT_STROKE: TextStroke = {
  color: "#000000",
  width: 0,
};

interface TextStyleControlsProps {
  clip: TextClip;
  onChange: (patch: Partial<TextClip>) => void;
}

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorRow: React.FC<ColorRowProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[10px] text-[var(--s-text-muted)]">{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-6 rounded cursor-pointer border border-[var(--s-border)] bg-transparent"
    />
  </div>
);

export const TextStyleControls: React.FC<TextStyleControlsProps> = ({
  clip,
  onChange,
}) => {
  const stroke = clip.stroke ?? DEFAULT_STROKE;
  const shadowEnabled = clip.shadow ? clip.shadow.enabled : true;
  const shadow = clip.shadow ?? DEFAULT_SHADOW;

  const patchStroke = (next: Partial<TextStroke>): void =>
    onChange({ stroke: { ...stroke, ...next } });

  const patchShadow = (next: Partial<TextShadow>): void =>
    onChange({ shadow: { ...DEFAULT_SHADOW, ...clip.shadow, ...next } });

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[11px] font-medium text-[var(--s-text-muted)]">Stroke</h4>
      <SliderRow
        label="Width"
        min={0}
        max={20}
        step={0.5}
        unit="px"
        value={stroke.width}
        onChange={(width) => patchStroke({ width })}
      />
      {stroke.width > 0 && (
        <ColorRow
          label="Stroke color"
          value={stroke.color}
          onChange={(color) => patchStroke({ color })}
        />
      )}

      <h4 className="mt-2 text-[11px] font-medium text-[var(--s-text-muted)]">Shadow</h4>
      <Toggle
        label="Drop shadow"
        active={shadowEnabled}
        onClick={() => patchShadow({ enabled: !shadowEnabled })}
      />
      {shadowEnabled && (
        <>
          <ColorRow
            label="Shadow color"
            value={shadow.color}
            onChange={(color) => patchShadow({ color })}
          />
          <SliderRow
            label="Blur"
            min={0}
            max={40}
            step={1}
            unit="px"
            value={shadow.blur}
            onChange={(blur) => patchShadow({ blur })}
          />
          <SliderRow
            label="Offset X"
            min={-30}
            max={30}
            step={1}
            unit="px"
            value={shadow.offsetX}
            onChange={(offsetX) => patchShadow({ offsetX })}
          />
          <SliderRow
            label="Offset Y"
            min={-30}
            max={30}
            step={1}
            unit="px"
            value={shadow.offsetY}
            onChange={(offsetY) => patchShadow({ offsetY })}
          />
        </>
      )}
    </div>
  );
};
