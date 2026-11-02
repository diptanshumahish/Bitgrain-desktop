import React from "react";
import { Slider } from "@bitgrain/ui/controls/toolbar/slider";

const QUALITY_MIN = 1;
const QUALITY_MAX = 100;
const QUALITY_STEP = 1;

interface QualitySliderProps {
  label: string;
  valueLabel: string;
  quality: number;
  onQualityChange: (value: number) => void;
}

export const QualitySlider: React.FC<QualitySliderProps> = ({ label, valueLabel, quality, onQualityChange }) => (
  <div className="flex flex-col gap-2 px-3 py-2.5">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] font-medium text-[var(--s-text)]">{label}</span>
      <span className="text-[12px] text-[var(--s-text-subtle)] tabular-nums">{valueLabel}</span>
    </div>
    <Slider min={QUALITY_MIN} max={QUALITY_MAX} step={QUALITY_STEP} value={quality} onChange={onQualityChange} label={label} />
  </div>
);
