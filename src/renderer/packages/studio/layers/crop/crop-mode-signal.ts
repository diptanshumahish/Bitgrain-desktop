import { signal } from "@bitgrain/core/signal";

export const cropLayerIdSignal = signal<string | null>(null);

export const enterCropMode = (layerId: string): void => {
  cropLayerIdSignal.value = layerId;
};

export const exitCropMode = (): void => {
  cropLayerIdSignal.value = null;
};
