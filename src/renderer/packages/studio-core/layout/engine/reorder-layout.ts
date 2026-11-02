import type { Layer } from "../../model/studio-types";
import { flowChildren, isHorizontalFlow, type ChildFrame, type LayoutContainer } from "./layout-container";

const centerOf = (frames: ChildFrame[], id: string): { x: number; y: number } => {
  const frame = frames.find((candidate) => candidate.id === id);
  if (!frame) return { x: 0, y: 0 };
  return { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
};

const flexTargetIndex = (
  flow: Layer[],
  frames: ChildFrame[],
  draggedId: string,
  pointer: number,
  horizontal: boolean,
): number => {
  const others = flow.filter((layer) => layer.id !== draggedId);
  return others.reduce((index, other) => {
    const center = centerOf(frames, other.id);
    return (horizontal ? center.x : center.y) < pointer ? index + 1 : index;
  }, 0);
};

const gridSwapTarget = (flow: Layer[], frames: ChildFrame[], draggedId: string, pointerX: number, pointerY: number): number => {
  const distanceTo = (id: string): number => {
    const center = centerOf(frames, id);
    return (center.x - pointerX) ** 2 + (center.y - pointerY) ** 2;
  };
  let best = -1;
  let bestDistance = distanceTo(draggedId);
  flow.forEach((layer, index) => {
    if (layer.id === draggedId) return;
    const distance = distanceTo(layer.id);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
};

const mergeFlowOrder = (all: Layer[], nextFlow: Layer[]): Layer[] => {
  let cursor = 0;
  return all.map((layer) => {
    if (layer.layoutAbsolute) return layer;
    const next = nextFlow[cursor];
    cursor += 1;
    return next;
  });
};

const reorderFlow = (
  container: LayoutContainer,
  flow: Layer[],
  frames: ChildFrame[],
  draggedId: string,
  pointerX: number,
  pointerY: number,
): Layer[] | null => {
  const currentIndex = flow.findIndex((layer) => layer.id === draggedId);
  if (container.layout === "grid") {
    const swapIndex = gridSwapTarget(flow, frames, draggedId, pointerX, pointerY);
    if (swapIndex < 0) return null;
    const next = [...flow];
    [next[currentIndex], next[swapIndex]] = [next[swapIndex], next[currentIndex]];
    return next;
  }
  const horizontal = isHorizontalFlow(container);
  const targetIndex = flexTargetIndex(flow, frames, draggedId, horizontal ? pointerX : pointerY, horizontal);
  if (targetIndex === currentIndex) return null;
  const rest = flow.filter((layer) => layer.id !== draggedId);
  rest.splice(Math.min(targetIndex, rest.length), 0, flow[currentIndex]);
  return rest;
};

export const reorderByPointer = (
  container: LayoutContainer,
  frames: ChildFrame[],
  draggedId: string,
  pointerX: number,
  pointerY: number,
): Layer[] | null => {
  const flow = flowChildren(container);
  if (!flow.some((layer) => layer.id === draggedId)) return null;
  const nextFlow = reorderFlow(container, flow, frames, draggedId, pointerX, pointerY);
  return nextFlow ? mergeFlowOrder(container.layers, nextFlow) : null;
};
