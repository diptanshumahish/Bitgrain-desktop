import type { TransformMode } from "../../../engine/types";
import { modesSignal, printFinishSignal } from "../../../store/transform-store";
import { dismissHomeTour } from "../../tutorial/dismiss-home-tour";
import { swapMainEffect } from "./main-effect-modes";

const MONO_EFFECTS: ReadonlySet<TransformMode> = new Set<TransformMode>(["manga", "braille", "ascii", "dither"]);

export const selectMainEffect = (effect: TransformMode): void => {
  modesSignal.value = swapMainEffect(modesSignal.value, effect);
  if (MONO_EFFECTS.has(effect)) printFinishSignal.value = false;
  dismissHomeTour();
};
