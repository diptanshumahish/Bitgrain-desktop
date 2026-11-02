import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";

const NUDGE_STEP = 1;
const NUDGE_STEP_LARGE = 10;

interface NudgeOffset {
  dx: number;
  dy: number;
}

const ARROW_DIRECTIONS: Record<string, NudgeOffset> = {
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
};

export const arrowNudgeOffset = (event: KeyboardEvent): NudgeOffset | null => {
  const direction = ARROW_DIRECTIONS[event.key];
  if (!direction || event.metaKey || event.ctrlKey || event.altKey) return null;
  const step = event.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP;
  return { dx: direction.dx * step, dy: direction.dy * step };
};

export const unlockedLayerIds = (layers: Layer[], ids: string[]): string[] =>
  ids.filter((id) => findLayerById(layers, id)?.locked !== true);

export const nudgeLayers = (layers: Layer[], ids: string[], offset: NudgeOffset): Layer[] =>
  updateLayersRecursively(layers, ids, (layer) => ({ x: layer.x + offset.dx, y: layer.y + offset.dy }));
