import React from "react";
import { Slider } from "../../ui/slider";
import { exportQualitySignal } from "../export-state";

interface QualitySliderProps {
  quality: number;
  // Desktop: PNG export also takes quality (as colour reduction), so the caller names it.
  label?: string;
}

const MIN_QUALITY_PERCENT = 10;
const MAX_QUALITY_PERCENT = 100;
const PERCENT = 100;

export const QualitySlider: React.FC<QualitySliderProps> = ({ quality, label = "Quality" }) => (
  <Slider
    label={label}
    value={Math.round(quality * PERCENT)}
    min={MIN_QUALITY_PERCENT}
    max={MAX_QUALITY_PERCENT}
    suffix="%"
    onChange={(percent) => {
      exportQualitySignal.value = percent / PERCENT;
    }}
  />
);
