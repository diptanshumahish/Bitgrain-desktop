import React from "react";
import { HalftoneSliderRow } from "./HalftoneSliderRow";
import { HalftoneSegmented } from "./HalftoneSegmented";
import { HALFTONE_TIPS, STYLE_OPTIONS } from "./halftone-copy";
import { DOT_SIZE_MAX, DOT_SIZE_MIN, DOT_SIZE_STEP, dotPitchReadout, dotSizeFromLines, linesFromDotSize } from "./dot-size-scale";
import { setHalftoneContrast, setHalftoneGrit, setHalftoneLines, setHalftoneStyle } from "./halftone-setters";
import type { HalftoneControls } from "./use-halftone-controls";

const CONTRAST_MIN = 0.5;
const CONTRAST_MAX = 3;
const CONTRAST_STEP = 0.1;
const GRIT_MAX = 1;
const GRIT_STEP = 0.05;
const PERCENT = 100;

interface HalftoneEssentialsProps {
  controls: HalftoneControls;
  onDone: () => void;
}

export const HalftoneEssentials: React.FC<HalftoneEssentialsProps> = ({ controls, onDone }) => (
  <div className="flex flex-col gap-2.5 px-1 pb-0.5">
    <HalftoneSliderRow
      label="Dot size"
      tip={HALFTONE_TIPS.dotSize}
      min={DOT_SIZE_MIN}
      max={DOT_SIZE_MAX}
      step={DOT_SIZE_STEP}
      value={dotSizeFromLines(controls.lines || DOT_SIZE_MAX)}
      readout={dotPitchReadout(controls.lines, controls.imageLongEdge)}
      onChange={(value) => setHalftoneLines(linesFromDotSize(value))}
      onDone={onDone}
    />
    <HalftoneSegmented
      label="Style"
      tip={HALFTONE_TIPS.style}
      options={STYLE_OPTIONS}
      value={controls.style}
      onSelect={(value) => {
        setHalftoneStyle(value);
        onDone();
      }}
    />
    <HalftoneSliderRow
      label="Contrast"
      tip={HALFTONE_TIPS.contrast}
      min={CONTRAST_MIN}
      max={CONTRAST_MAX}
      step={CONTRAST_STEP}
      value={controls.contrast}
      readout={`${controls.contrast.toFixed(1)}×`}
      onChange={setHalftoneContrast}
      onDone={onDone}
    />
    <HalftoneSliderRow
      label="Grit"
      tip={HALFTONE_TIPS.grit}
      min={0}
      max={GRIT_MAX}
      step={GRIT_STEP}
      value={controls.grit}
      readout={`${Math.round(controls.grit * PERCENT)}%`}
      onChange={setHalftoneGrit}
      onDone={onDone}
    />
  </div>
);
