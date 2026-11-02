import { modesSignal, isColorSignal, lutIdSignal } from "../../state/transform-store";
import { printFinishSignal, printFinishStrengthSignal } from "@bitgrain/engine/finish/print-finish-state";
import { buildPrintFinishOptions, type PrintFinishOptions } from "@bitgrain/engine/finish/print-finish";
import type { TransformMode } from "@bitgrain/engine/core/types";

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
