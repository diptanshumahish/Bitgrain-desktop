import { printFinishSignal, printFinishStrengthSignal, modesSignal, isColorSignal, lutIdSignal } from "../../../store/transform-store";
import { buildPrintFinishOptions, type PrintFinishOptions } from "../../../engine/print-finish";
import type { TransformMode } from "../../../engine/types";

const isTextMode = (mode: TransformMode): boolean =>
  mode === "ascii" || mode === "braille";

export const resolvePrintFinish = (
  isFallback: boolean,
  bgColor: string,
): PrintFinishOptions | null => {
  const modes = modesSignal.value;
  if (!printFinishSignal.value || isFallback || modes.some(isTextMode)) return null;
  return buildPrintFinishOptions(printFinishStrengthSignal.value, bgColor, !isColorSignal.value && !lutIdSignal.value);
};
