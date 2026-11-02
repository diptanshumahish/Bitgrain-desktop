import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { makeDuplicateName } from "./duplicate-name";
import { rememberDuplicate, resolveDuplicateOffset } from "./duplicate-offset-memory";

const makeLayerId = (layer: Layer): string =>
  `${layer.type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const cloneLayersInPlace = (sources: Layer[], siblings: Layer[]): Layer[] => {
  const takenNames = new Set(siblings.map((layer) => layer.name));
  return sources.map((layer): Layer => {
    const name = makeDuplicateName(layer.name, takenNames);
    takenNames.add(name);
    return { ...layer, id: makeLayerId(layer), name };
  });
};

export const cloneLayersForDuplicate = (sources: Layer[], siblings: Layer[]): Layer[] => {
  if (sources.length === 0) return [];
  const offset = resolveDuplicateOffset(sources);
  const clones = cloneLayersInPlace(sources, siblings).map(
    (clone): Layer => ({ ...clone, x: clone.x + offset.x, y: clone.y + offset.y }),
  );
  rememberDuplicate(sources, clones);
  return clones;
};
