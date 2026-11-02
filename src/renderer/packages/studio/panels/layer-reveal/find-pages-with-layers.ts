import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";

export const findPageIdsWithLayers = (pages: TemplatePage[], layerIds: string[]): string[] =>
  pages
    .filter((page) => layerIds.some((id) => findLayerById(page.layers, id) !== null))
    .map((page) => page.id);
