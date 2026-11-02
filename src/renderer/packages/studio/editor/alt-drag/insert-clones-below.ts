import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { cloneLayersWithFreshIds } from "@bitgrain/studio-core/templates/template-pages";
import { isContainerLayer, type ContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { renameAsCopies } from "../duplicate/rename-copies";

export const insertClonesBelow = (layers: Layer[], ids: string[]): Layer[] =>
  layers.flatMap((layer): Layer[] => {
    if (ids.includes(layer.id)) return [...renameAsCopies(cloneLayersWithFreshIds([layer]), layers), layer];
    if (!isContainerLayer(layer)) return [layer];
    return [{ ...layer, layers: insertClonesBelow(layer.layers, ids) } as ContainerLayer];
  });
