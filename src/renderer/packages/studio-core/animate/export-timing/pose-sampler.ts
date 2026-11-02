import type { Layer } from "../../model/studio-types";
import type { PageAnimation } from "../../model/animation-types";
import { poseLayersAtTime } from "../tween-layers";

export type PoseSampler = (timeMs: number) => Map<string, Layer>;

export const createPoseSampler = (
  baseLayers: Layer[],
  animation: PageAnimation,
  flatten: (layers: Layer[]) => Layer[],
): PoseSampler => {
  const cache = new Map<number, Map<string, Layer>>();
  return (timeMs) => {
    const cached = cache.get(timeMs);
    if (cached) return cached;
    const leaves = flatten(poseLayersAtTime(baseLayers, animation, timeMs));
    const byId = new Map(leaves.map((leaf) => [leaf.id, leaf]));
    cache.set(timeMs, byId);
    return byId;
  };
};
