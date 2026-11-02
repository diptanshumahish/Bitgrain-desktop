import type { Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { refitTextLayer } from "../../../layers/text-box/text-box-fit";
import type { LayerUpdateEntry } from "./layer-update-entry";

type LayerUpdater = (layer: Layer) => Partial<Layer> | null;

const fitted = (layer: Layer, updates: Partial<Layer>): Partial<Layer> =>
  layer.type === "text" ? refitTextLayer(layer, updates as Partial<TextLayer>) : updates;

export const buildEntries = (layers: Layer[], updater: LayerUpdater): LayerUpdateEntry[] =>
  layers.flatMap((layer) => {
    const updates = updater(layer);
    return updates ? [{ id: layer.id, updates: fitted(layer, updates) }] : [];
  });
