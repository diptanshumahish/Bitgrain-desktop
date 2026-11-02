import { signal } from "@bitgrain/core/signal";

export interface LayerDragSession {
  pageId: string;
  layerIds: string[];
  startedOffPageIds: string[];
}

export const layerDragSessionSignal = signal<LayerDragSession | null>(null);

export const startLayerDragSession = (session: LayerDragSession): void => {
  layerDragSessionSignal.value = session;
};

export const endLayerDragSession = (): void => {
  layerDragSessionSignal.value = null;
};
