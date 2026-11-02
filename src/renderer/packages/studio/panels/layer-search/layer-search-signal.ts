import { signal, useSignalValue } from "@bitgrain/core/signal";

const layerSearchSignal = signal("");

export function setLayerSearchQuery(query: string): void {
  layerSearchSignal.value = query;
}

export function useLayerSearchQuery(): string {
  return useSignalValue(layerSearchSignal);
}
