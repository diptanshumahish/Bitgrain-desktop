import { signal } from "@bitgrain/core/signal";
import type { Layer } from "../../model/studio-types";
import { isPathSource } from "./attach-text-path";

export const pageLayersSignal = signal<Layer[]>([]);

export const pathSourceLayers = (layers: Layer[]): Layer[] => layers.filter(isPathSource);

export const publishPageLayers = (layers: Layer[]): void => {
  pageLayersSignal.value = layers;
};
