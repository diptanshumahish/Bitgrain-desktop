import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";

export const resolveSelectedLayers = (layers: Layer[], selectedIds: string[]): Layer[] =>
  selectedIds.map((id) => findLayerById(layers, id)).filter((layer): layer is Layer => layer !== null);
