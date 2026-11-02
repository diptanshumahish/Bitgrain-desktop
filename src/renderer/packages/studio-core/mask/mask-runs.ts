import type { Layer, LayerType } from "../model/studio-types";

const MASKABLE_TYPES: ReadonlySet<LayerType> = new Set<LayerType>(["shape", "vector", "text", "image", "upload"]);

interface LayerSlot<T extends Layer> {
  layer: T;
  index: number;
}

interface SingleRunEntry<T extends Layer> {
  kind: "single";
  slot: LayerSlot<T>;
}

export interface MaskRunEntry<T extends Layer> {
  kind: "mask";
  mask: LayerSlot<T>;
  members: LayerSlot<T>[];
}

type RunEntry<T extends Layer> = SingleRunEntry<T> | MaskRunEntry<T>;

export const canBeMask = (layer: Layer): boolean => MASKABLE_TYPES.has(layer.type);

export const isActiveMask = (layer: Layer): boolean => Boolean(layer.isMask) && layer.visible && canBeMask(layer);

const appendSlot = <T extends Layer>(entries: RunEntry<T>[], slot: LayerSlot<T>): RunEntry<T>[] => {
  const last = entries[entries.length - 1];
  if (isActiveMask(slot.layer)) return [...entries, { kind: "mask", mask: slot, members: [] }];
  if (last?.kind === "mask") return [...entries.slice(0, -1), { ...last, members: [...last.members, slot] }];
  return [...entries, { kind: "single", slot }];
};

export const groupMaskRuns = <T extends Layer>(layers: T[]): RunEntry<T>[] =>
  layers.reduce<RunEntry<T>[]>((entries, layer, index) => appendSlot(entries, { layer, index }), []);

export const maskedLayerIds = (layers: Layer[]): ReadonlySet<string> =>
  new Set(
    groupMaskRuns(layers).flatMap((entry) => (entry.kind === "mask" ? entry.members.map((slot) => slot.layer.id) : [])),
  );
