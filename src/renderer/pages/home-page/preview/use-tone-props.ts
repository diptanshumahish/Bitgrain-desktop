import { useSignalValue } from "../../../lib/signal";
import {
  modesSignal,
  lutIdSignal,
  ditherMethodSignal,
  ditherFactorSignal,
  resolutionSignal,
  contrastSignal,
  brightnessSignal,
  saturationSignal,
  grainSignal,
  hueSignal,
  printFinishSignal,
  printFinishStrengthSignal,
  paletteSignal,
  isColorSignal,
  paperColorSignal,
} from "../../../store/transform-store";
import type { TransformMode } from "../../../engine/types";
import type { OutputPreviewProps } from "../../../components/output-preview/types";

const LUT_DEFAULT_RESOLUTION = 2.0;
const NEUTRAL = 1.0;
const NO_SHIFT = 0;

type ToneProps = Pick<
  OutputPreviewProps,
  | "resolution" | "contrast" | "brightness" | "saturation" | "mode" | "ditherMethod" | "ditherFactor"
  | "isColor" | "noise" | "hue" | "printFinish" | "printFinishStrength" | "palette" | "lutId" | "paperColor"
>;

const gradeModes = (modes: TransformMode[]): TransformMode[] =>
  modes.includes("haze-bloom") ? ["haze-bloom", "lut"] : ["lut"];

export const useToneProps = (): ToneProps => {
  const modes = useSignalValue(modesSignal);
  const lutId = useSignalValue(lutIdSignal);
  const palette = useSignalValue(paletteSignal);
  const isGrade = !!lutId;
  const tone = {
    resolution: useSignalValue(resolutionSignal),
    contrast: useSignalValue(contrastSignal),
    brightness: useSignalValue(brightnessSignal),
    saturation: useSignalValue(saturationSignal),
    isColor: useSignalValue(isColorSignal),
    noise: useSignalValue(grainSignal),
    hue: useSignalValue(hueSignal),
  };
  return {
    resolution: isGrade ? LUT_DEFAULT_RESOLUTION : tone.resolution,
    contrast: isGrade ? NEUTRAL : tone.contrast,
    brightness: isGrade ? NEUTRAL : tone.brightness,
    saturation: isGrade ? NEUTRAL : tone.saturation,
    isColor: isGrade ? true : tone.isColor,
    noise: isGrade ? NO_SHIFT : tone.noise,
    hue: isGrade ? NO_SHIFT : tone.hue,
    mode: isGrade ? gradeModes(modes) : modes,
    ditherMethod: useSignalValue(ditherMethodSignal),
    ditherFactor: useSignalValue(ditherFactorSignal),
    printFinish: useSignalValue(printFinishSignal),
    printFinishStrength: useSignalValue(printFinishStrengthSignal),
    palette: isGrade ? undefined : palette ?? undefined,
    lutId: lutId ?? undefined,
    paperColor: useSignalValue(paperColorSignal),
  };
};
