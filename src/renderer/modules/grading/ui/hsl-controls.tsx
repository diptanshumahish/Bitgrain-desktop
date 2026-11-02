import React, { useState } from "react";
import { Slider } from "../../../components/studio/ui/slider";
import type { ColorGrade, HslAdjustment, HslBand } from "../engine/grade-types";
import { HSL_BANDS } from "../engine/grade-defaults";

interface HslControlsProps {
  grade: ColorGrade;
  onChange: (grade: ColorGrade) => void;
  onCommit?: () => void;
}

const BAND_SWATCH: Record<HslBand, string> = {
  red: "bg-[#e5484d]",
  orange: "bg-[#f76b15]",
  yellow: "bg-[#ffc53d]",
  green: "bg-[#30a46c]",
  aqua: "bg-[#12a594]",
  blue: "bg-[#3e63dd]",
  purple: "bg-[#8e4ec6]",
  magenta: "bg-[#d6409f]",
};

const HSL_FIELDS: Array<{ key: keyof HslAdjustment; label: string }> = [
  { key: "hue", label: "hue" },
  { key: "saturation", label: "saturation" },
  { key: "luminance", label: "luminance" },
];

const SIGNED_MIN = -100;
const SIGNED_MAX = 100;

const isBandEdited = (adjustment: HslAdjustment): boolean =>
  adjustment.hue !== 0 || adjustment.saturation !== 0 || adjustment.luminance !== 0;

export const HslControls: React.FC<HslControlsProps> = ({ grade, onChange, onCommit }) => {
  const [band, setBand] = useState<HslBand>("red");
  const adjustment = grade.hsl[band];

  const updateField = (key: keyof HslAdjustment, value: number): void => {
    onChange({ ...grade, hsl: { ...grade.hsl, [band]: { ...adjustment, [key]: value } } });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-1">
        {HSL_BANDS.map((option) => (
          <button
            key={option}
            type="button"
            title={option}
            aria-label={option}
            aria-pressed={band === option}
            onClick={() => setBand(option)}
            className={`relative w-[22px] h-[22px] rounded-full border-2 cursor-pointer transition-transform ${BAND_SWATCH[option]} ${
              band === option ? "border-[var(--s-text)] scale-110" : "border-transparent hover:scale-105"
            } ${isBandEdited(grade.hsl[option]) ? "ring-1 ring-offset-1 ring-offset-[var(--s-bg-panel)] ring-[var(--s-accent)]" : ""}`}
          />
        ))}
      </div>
      <span className="text-[11px] text-[var(--s-text-subtle)]">{band}</span>
      {HSL_FIELDS.map((field) => (
        <Slider
          key={field.key}
          label={field.label}
          value={adjustment[field.key]}
          min={SIGNED_MIN}
          max={SIGNED_MAX}
          onChange={(value) => updateField(field.key, value)}
          onCommit={onCommit}
        />
      ))}
    </div>
  );
};
