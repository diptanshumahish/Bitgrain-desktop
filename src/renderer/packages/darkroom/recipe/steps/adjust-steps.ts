import { NEUTRAL_HUE, NEUTRAL_TONE } from "../../state/transform-store";
import type { RecipeInputs, RecipeStep, ToneValues } from "../recipe-types";

const toneChanged = (tone: ToneValues): boolean =>
  tone.contrast !== NEUTRAL_TONE
  || tone.brightness !== NEUTRAL_TONE
  || tone.saturation !== NEUTRAL_TONE
  || tone.hue !== NEUTRAL_HUE;

export const adjustSteps = (inputs: RecipeInputs): RecipeStep[] => {
  if (!toneChanged(inputs.tone) && inputs.gradeIsNeutral) return [];
  const detail = inputs.gradeIsNeutral ? "Brightness and contrast" : "Custom grade";
  return [{ id: "adjust", kind: "adjust", title: "Tone", detail, panel: "tone", removal: { type: "adjust" } }];
};
