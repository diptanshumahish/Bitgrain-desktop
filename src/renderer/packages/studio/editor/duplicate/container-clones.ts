import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { ContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { cloneLayersForDuplicate, cloneLayersInPlace } from "./clone-layers";
import { findPatternRun, placeAlongPattern } from "./pattern-run";

export const makeContainerClones = (parent: ContainerLayer, sources: Layer[]): Layer[] => {
  if (parent.type !== "group") return cloneLayersForDuplicate(sources, parent.layers);
  if (parent.layout !== "none") return cloneLayersInPlace(sources, parent.layers);
  const run = findPatternRun(parent.layers);
  if (!run) return cloneLayersForDuplicate(sources, parent.layers);
  return placeAlongPattern(cloneLayersInPlace(sources, parent.layers), run);
};
