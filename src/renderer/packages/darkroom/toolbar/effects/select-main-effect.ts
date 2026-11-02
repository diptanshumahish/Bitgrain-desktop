import type { TransformMode } from "@bitgrain/engine/core/types";
import { modesSignal } from "../../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { dismissHomeTour } from "../../editor/tour/dismiss-home-tour";
import { swapMainEffect } from "./main-effect-modes";

const MONO_EFFECTS: ReadonlySet<TransformMode> = new Set<TransformMode>(["manga", "braille", "ascii", "dither"]);

export const selectMainEffect = (effect: TransformMode): void => {
  modesSignal.value = swapMainEffect(modesSignal.value, effect);
  if (MONO_EFFECTS.has(effect)) printFinishSignal.value = false;
  dismissHomeTour();
};
