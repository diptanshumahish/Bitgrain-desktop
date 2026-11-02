import React from "react";
import { LabeledSlider } from "@bitgrain/ui/controls/toolbar/controls/LabeledSlider";
import { RESOLUTION_MAX, RESOLUTION_MIN } from "../../../state/transform-store";
import type { ToolbarState } from "../../use-toolbar-state";

const PERCENT_SCALE = 100;
const RESOLUTION_STEP = 0.1;
const MULTIPLIER_STEP = 0.1;
const HUE_STEP = 5;
const HUE_MAX = 360;
const CONTRAST_RANGE: [number, number] = [0.5, 3];
const BRIGHTNESS_RANGE: [number, number] = [0.5, 2];
const SATURATION_RANGE: [number, number] = [0, 2];

interface ToneBasicsProps {
  state: ToolbarState;
}

export const ToneBasics: React.FC<ToneBasicsProps> = ({ state: s }) => (
  <div className="flex flex-col gap-2 px-1 pb-1">
    <LabeledSlider label="Brightness" value={s.brightness} min={BRIGHTNESS_RANGE[0]} max={BRIGHTNESS_RANGE[1]} step={MULTIPLIER_STEP}
      decimals={1} suffix="x" onChange={s.setBrightness} onCommit={s.onDone} />
    <LabeledSlider label="Contrast" value={s.contrast} min={CONTRAST_RANGE[0]} max={CONTRAST_RANGE[1]} step={MULTIPLIER_STEP}
      decimals={1} suffix="x" onChange={s.setContrast} onCommit={s.onDone} />
    <LabeledSlider label="Saturation" value={s.saturation} min={SATURATION_RANGE[0]} max={SATURATION_RANGE[1]} step={MULTIPLIER_STEP}
      decimals={1} suffix="x" onChange={s.setSaturation} onCommit={s.onDone} />
    <LabeledSlider label="Hue" value={s.hue} min={0} max={HUE_MAX} step={HUE_STEP} suffix="°" onChange={s.setHue} onCommit={s.onDone} />
    <LabeledSlider label="Resolution" value={s.resolution} min={RESOLUTION_MIN} max={RESOLUTION_MAX} step={RESOLUTION_STEP}
      scale={PERCENT_SCALE} suffix="%" onChange={s.setResolution} onCommit={s.onDone} />
  </div>
);
