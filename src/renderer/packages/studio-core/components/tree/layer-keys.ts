import type { Layer } from "../../model/studio-types";

type LayerRecord = Record<string, unknown>;

export const omitLayerKeys = (layer: Layer, keys: readonly string[]): LayerRecord => {
  const copy: LayerRecord = { ...(layer as unknown as LayerRecord) };
  for (const key of keys) delete copy[key];
  return copy;
};

export const pickLayerKeys = (layer: Layer, keys: readonly string[]): LayerRecord => {
  const source = layer as unknown as LayerRecord;
  const picked: LayerRecord = {};
  for (const key of keys) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked;
};
