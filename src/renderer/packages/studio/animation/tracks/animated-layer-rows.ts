import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { PageAnimation, TrackGroupId } from "@bitgrain/studio-core/model/animation-types";
import { animatedGroups } from "@bitgrain/studio-core/animate/tracks/layer-tracks";

interface AnimatedLayerRow {
  layer: Layer;
  depth: number;
  groups: TrackGroupId[];
}

const collect = (layers: Layer[], animation: PageAnimation, depth: number, out: AnimatedLayerRow[]): void => {
  for (const layer of layers) {
    const groups = animatedGroups(layer, animation);
    if (groups.length > 0) out.push({ layer, depth, groups });
    if (layer.type === "group" || layer.type === "frame") collect(layer.layers, animation, depth + 1, out);
  }
};

export const collectAnimatedRows = (layers: Layer[], animation: PageAnimation): AnimatedLayerRow[] => {
  const out: AnimatedLayerRow[] = [];
  collect([...layers].reverse(), animation, 0, out);
  return out;
};
