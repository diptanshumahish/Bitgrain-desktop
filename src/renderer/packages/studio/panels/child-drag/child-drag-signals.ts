import { signal } from "@bitgrain/core/signal";

export type DropEdge = "above" | "below";

interface DraggedChild {
  id: string;
  parentId: string;
}

interface ChildDropTarget {
  id: string;
  edge: DropEdge;
}

export const draggedChildSignal = signal<DraggedChild | null>(null);
export const childDropTargetSignal = signal<ChildDropTarget | null>(null);
