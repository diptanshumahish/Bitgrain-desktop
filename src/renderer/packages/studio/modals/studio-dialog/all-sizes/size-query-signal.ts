import { signal } from "@bitgrain/core/signal";

export const sizeQuerySignal = signal("");

export const setSizeQuery = (query: string): void => {
  sizeQuerySignal.value = query;
};
