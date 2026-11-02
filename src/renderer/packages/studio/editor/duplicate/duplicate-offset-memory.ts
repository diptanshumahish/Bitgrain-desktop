import type { Layer } from "@bitgrain/studio-core/model/studio-types";

const DEFAULT_DUPLICATE_OFFSET_PX = 16;

interface Point {
  x: number;
  y: number;
}

interface DuplicateMemory {
  cloneIds: string[];
  sourceOrigin: Point;
}

const lastDuplicate: { current: DuplicateMemory | null } = { current: null };

const originOf = (layers: Layer[]): Point => ({
  x: Math.min(...layers.map((layer) => layer.x)),
  y: Math.min(...layers.map((layer) => layer.y)),
});

const isSameSelection = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((id) => right.includes(id));

export const resolveDuplicateOffset = (sources: Layer[]): Point => {
  const memory = lastDuplicate.current;
  const sourceIds = sources.map((layer) => layer.id);
  if (!memory || !isSameSelection(memory.cloneIds, sourceIds)) {
    return { x: DEFAULT_DUPLICATE_OFFSET_PX, y: DEFAULT_DUPLICATE_OFFSET_PX };
  }
  const origin = originOf(sources);
  return { x: origin.x - memory.sourceOrigin.x, y: origin.y - memory.sourceOrigin.y };
};

export const rememberDuplicate = (sources: Layer[], clones: Layer[]): void => {
  lastDuplicate.current = { cloneIds: clones.map((clone) => clone.id), sourceOrigin: originOf(sources) };
};
