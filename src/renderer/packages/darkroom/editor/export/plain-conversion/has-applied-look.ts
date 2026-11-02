import { modesSignal, lutIdSignal, paletteSignal, contrastSignal, brightnessSignal, saturationSignal, grainSignal, hueSignal } from "../../../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { gradeForSnapshot } from "../../../grading/editor/editor-grade-store";
import { masksSignal } from "../../../grading/editor/editor-mask-store";

const NEUTRAL_TONE = 1;
const NO_GRAIN = 0;
const NO_HUE_SHIFT = 0;
const PLAIN_MODE = "original";

const hasEffectMode = (): boolean => modesSignal.value.some((mode) => mode !== PLAIN_MODE);

const hasToneAdjustment = (): boolean =>
  contrastSignal.value !== NEUTRAL_TONE ||
  brightnessSignal.value !== NEUTRAL_TONE ||
  saturationSignal.value !== NEUTRAL_TONE ||
  grainSignal.value !== NO_GRAIN ||
  hueSignal.value !== NO_HUE_SHIFT;

const hasColorLook = (): boolean =>
  lutIdSignal.value !== null || paletteSignal.value !== null || gradeForSnapshot() !== undefined;

export const hasAppliedLook = (): boolean =>
  hasEffectMode() || hasToneAdjustment() || hasColorLook() || printFinishSignal.value || masksSignal.value.length > 0;
