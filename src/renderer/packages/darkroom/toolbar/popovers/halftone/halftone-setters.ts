import {
  contrastSignal,
  halftoneAngleSignal,
  halftoneIntensitySignal,
  halftoneInvertSignal,
  halftoneLinesSignal,
  halftoneShapeSignal,
  halftoneSharpnessSignal,
  halftoneGritSignal,
  halftoneStyleSignal,
  saturationSignal,
  isColorSignal,
} from "../../../state/transform-store";
import type { HalftoneShape, HalftoneStyle } from "@bitgrain/engine/plugins/halftone/halftone-defaults";

export const setHalftoneLines = (value: number): void => { halftoneLinesSignal.value = value; };
const DESATURATED = 0;
const NEUTRAL_SATURATION = 1;

export const setHalftoneStyle = (value: HalftoneStyle): void => {
  halftoneStyleSignal.value = value;
  if (value === "mono") return;
  isColorSignal.value = true;
  if (saturationSignal.value === DESATURATED) saturationSignal.value = NEUTRAL_SATURATION;
};
export const setHalftoneContrast = (value: number): void => { contrastSignal.value = value; };
export const setHalftoneAngle = (value: number): void => { halftoneAngleSignal.value = value; };
export const setHalftoneShape = (value: HalftoneShape): void => { halftoneShapeSignal.value = value; };
export const setHalftoneSharpness = (value: number): void => { halftoneSharpnessSignal.value = value; };
export const setHalftoneIntensity = (value: number): void => { halftoneIntensitySignal.value = value; };
export const setHalftoneGrit = (value: number): void => { halftoneGritSignal.value = value; };
export const setHalftoneInvert = (value: boolean): void => { halftoneInvertSignal.value = value; };
