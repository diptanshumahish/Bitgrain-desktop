import { useSignalValue } from "@bitgrain/core/signal";
import { childDropTargetSignal, draggedChildSignal, type DropEdge } from "./child-drag-signals";

interface ChildDragState {
  isDragging: boolean;
  dropEdge: DropEdge | null;
}

export const useChildDragState = (layerId: string): ChildDragState => {
  const dragged = useSignalValue(draggedChildSignal);
  const dropTarget = useSignalValue(childDropTargetSignal);
  return {
    isDragging: dragged?.id === layerId,
    dropEdge: dropTarget?.id === layerId ? dropTarget.edge : null,
  };
};
