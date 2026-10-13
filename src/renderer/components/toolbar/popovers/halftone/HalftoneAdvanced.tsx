import React from "react";
import { HalftoneSliderRow } from "./HalftoneSliderRow";
import { HalftoneSegmented } from "./HalftoneSegmented";
import { HalftoneLabel } from "./HalftoneLabel";
import { ToggleSwitch } from "../../controls/ToggleSwitch";
import { HALFTONE_TIPS, SHAPE_OPTIONS } from "./halftone-copy";
import {
  setHalftoneAngle,
  setHalftoneIntensity,
  setHalftoneInvert,
  setHalftoneShape,
  setHalftoneSharpness,
} from "./halftone-setters";
import type { HalftoneControls } from "./use-halftone-controls";

const ANGLE_MAX = 90;
const ANGLE_STEP = 5;
const SHARPNESS_MAX = 100;
const INTENSITY_MIN = 0.1;
const INTENSITY_MAX = 3;
const INTENSITY_STEP = 0.1;

interface HalftoneAdvancedProps {
  controls: HalftoneControls;
  onDone: () => void;
}

export const HalftoneAdvanced: React.FC<HalftoneAdvancedProps> = ({ controls, onDone }) => (
  <details className="group px-1">
    <summary className="cursor-pointer select-none list-none text-[12px] font-semibold text-[var(--s-text-subtle)] hover:text-[var(--s-text)] py-1">
      <span className="inline-block transition-transform group-open:rotate-90 mr-1">›</span>
      Advanced
    </summary>
    <div className="flex flex-col gap-2.5 pt-1.5 pb-0.5">
      <HalftoneSliderRow label="Angle" tip={HALFTONE_TIPS.angle} min={0} max={ANGLE_MAX} step={ANGLE_STEP}
        value={controls.angle} readout={`${controls.angle}°`} onChange={setHalftoneAngle} onDone={onDone} />
      <HalftoneSegmented label="Shape" tip={HALFTONE_TIPS.shape} options={SHAPE_OPTIONS} value={controls.shape}
        onSelect={(value) => { setHalftoneShape(value); onDone(); }} />
      <HalftoneSliderRow label="Sharpness" tip={HALFTONE_TIPS.sharpness} min={0} max={SHARPNESS_MAX} step={1}
        value={controls.sharpness} readout={`${controls.sharpness}`} onChange={setHalftoneSharpness} onDone={onDone} />
      <HalftoneSliderRow label="Intensity" tip={HALFTONE_TIPS.intensity} min={INTENSITY_MIN} max={INTENSITY_MAX}
        step={INTENSITY_STEP} value={controls.intensity} readout={`${controls.intensity.toFixed(1)}×`}
        onChange={setHalftoneIntensity} onDone={onDone} />
      <div className="flex items-center justify-between">
        <HalftoneLabel text="Ink on paper" tip={HALFTONE_TIPS.invert} />
        <ToggleSwitch checked={controls.invert} label="Ink on paper"
          onChange={() => { setHalftoneInvert(!controls.invert); onDone(); }} />
      </div>
    </div>
  </details>
);
