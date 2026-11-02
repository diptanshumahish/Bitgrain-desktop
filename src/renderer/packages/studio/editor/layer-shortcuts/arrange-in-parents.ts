import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isContainerLayer, type ContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { moveToBack, moveToFront, shiftLayers } from "@bitgrain/studio-core/layers/layer-order";

export type ArrangeKind = "forward" | "backward" | "front" | "back";

const ARRANGERS: Record<ArrangeKind, (layers: Layer[], ids: string[]) => Layer[]> = {
  forward: (layers, ids) => shiftLayers(layers, ids, 1),
  backward: (layers, ids) => shiftLayers(layers, ids, -1),
  front: moveToFront,
  back: moveToBack,
};

export const arrangeInParents = (layers: Layer[], ids: string[], kind: ArrangeKind): Layer[] => {
  const levelIds = ids.filter((id) => layers.some((layer) => layer.id === id));
  const arranged = levelIds.length > 0 ? ARRANGERS[kind](layers, levelIds) : layers;
  return arranged.map((layer) =>
    isContainerLayer(layer)
      ? ({ ...layer, layers: arrangeInParents(layer.layers, ids, kind) } as ContainerLayer)
      : layer,
  );
};
