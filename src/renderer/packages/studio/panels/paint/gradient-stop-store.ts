import { signal } from "@bitgrain/core/signal";

export const selectedStopSignal = signal(0);

export const selectStop = (index: number): void => {
  selectedStopSignal.value = index;
};
