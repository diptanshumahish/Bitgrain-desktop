import { signal } from "@bitgrain/core/signal";
import type { SvgImportChoice } from "./svg-import-events";

export const svgChoiceQueueSignal = signal<SvgImportChoice[]>([]);

export const enqueueSvgChoice = (choice: SvgImportChoice): void => {
  svgChoiceQueueSignal.value = [...svgChoiceQueueSignal.value, choice];
};

const shiftQueue = (): SvgImportChoice | undefined => {
  const [current, ...rest] = svgChoiceQueueSignal.value;
  svgChoiceQueueSignal.value = rest;
  return current;
};

export const chooseEditable = (): void => shiftQueue()?.onEditable();

export const chooseImage = (): void => shiftQueue()?.onImage();

export const dismissSvgChoice = (): void => {
  shiftQueue();
};
