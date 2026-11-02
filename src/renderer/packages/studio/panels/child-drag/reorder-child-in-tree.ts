import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { isContainerLayer, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import type { DropEdge } from "./child-drag-signals";

interface ChildMove {
  parentId: string;
  draggedId: string;
  targetId: string;
  edge: DropEdge;
}

const moveInTopFirstOrder = (children: Layer[], move: ChildMove): Layer[] => {
  const topFirst = [...children].reverse();
  const dragged = topFirst.find((child) => child.id === move.draggedId);
  if (!dragged) return children;
  const remaining = topFirst.filter((child) => child.id !== move.draggedId);
  const targetIndex = remaining.findIndex((child) => child.id === move.targetId);
  if (targetIndex < 0) return children;
  const insertAt = move.edge === "above" ? targetIndex : targetIndex + 1;
  return [...remaining.slice(0, insertAt), dragged, ...remaining.slice(insertAt)].reverse();
};

export const reorderChildInTree = (layers: Layer[], move: ChildMove): Layer[] =>
  updateLayersRecursively(layers, [move.parentId], (parent) =>
    isContainerLayer(parent) ? { layers: moveInTopFirstOrder(parent.layers, move) } : {},
  );
