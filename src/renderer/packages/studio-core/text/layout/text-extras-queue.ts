import type { TextLayer } from "../../model/studio-types";

const pendingExtras = new Map<string, Partial<TextLayer>>();

export const queueTextExtras = (layerId: string, extras: Partial<TextLayer>): void => {
  pendingExtras.set(layerId, extras);
};

export const takeTextExtras = (layerId: string): Partial<TextLayer> => {
  const extras = pendingExtras.get(layerId) ?? {};
  pendingExtras.delete(layerId);
  return extras;
};
