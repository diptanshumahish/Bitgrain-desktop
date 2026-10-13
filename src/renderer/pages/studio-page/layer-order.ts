import type { Layer } from "../../data/studioTypes";

export function insertGroupAtTopMember(layers: Layer[], memberIds: string[], group: Layer): Layer[] {
  const topIndex = layers.reduce((top, layer, index) => (memberIds.includes(layer.id) ? index : top), -1);
  return layers.flatMap((layer, index) => {
    const kept = memberIds.includes(layer.id) ? [] : [layer];
    return index === topIndex ? [...kept, group] : kept;
  });
}

export function replaceWithChildren(layers: Layer[], groupId: string, children: Layer[]): Layer[] {
  return layers.flatMap((layer) => (layer.id === groupId ? children : [layer]));
}

export function moveToFront(layers: Layer[], ids: string[]): Layer[] {
  const moving = layers.filter((layer) => ids.includes(layer.id));
  return [...layers.filter((layer) => !ids.includes(layer.id)), ...moving];
}

export function moveToBack(layers: Layer[], ids: string[]): Layer[] {
  const moving = layers.filter((layer) => ids.includes(layer.id));
  return [...moving, ...layers.filter((layer) => !ids.includes(layer.id))];
}

export function swapWithNeighbour(layers: Layer[], id: string, direction: 1 | -1): Layer[] {
  const index = layers.findIndex((layer) => layer.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= layers.length) return layers;
  const next = [...layers];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function shiftLayers(layers: Layer[], ids: string[], direction: 1 | -1): Layer[] {
  const indexOf = (id: string): number => layers.findIndex((layer) => layer.id === id);
  const ordered = [...ids].sort((first, second) => (indexOf(second) - indexOf(first)) * direction);
  return ordered.reduce((current, id) => {
    const neighbour = current[current.findIndex((layer) => layer.id === id) + direction];
    if (!neighbour || ids.includes(neighbour.id)) return current;
    return swapWithNeighbour(current, id, direction);
  }, layers);
}

export type DistributeAxis = "horizontal" | "vertical";

export function distributePositions(layers: Layer[], axis: DistributeAxis): Map<string, Partial<Layer>> {
  const isHorizontal = axis === "horizontal";
  const start = (layer: Layer): number => (isHorizontal ? layer.x : layer.y);
  const size = (layer: Layer): number => (isHorizontal ? layer.width : layer.height);
  const sorted = [...layers].sort((first, second) => start(first) - start(second));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalSize = sorted.reduce((sum, layer) => sum + size(layer), 0);
  const gap = (start(last) + size(last) - start(first) - totalSize) / (sorted.length - 1);
  const updates = new Map<string, Partial<Layer>>();
  sorted.reduce((cursor, layer) => {
    updates.set(layer.id, isHorizontal ? { x: cursor } : { y: cursor });
    return cursor + size(layer) + gap;
  }, start(first));
  return updates;
}
