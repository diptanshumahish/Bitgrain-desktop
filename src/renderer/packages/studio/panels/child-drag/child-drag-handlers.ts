import type React from "react";
import { childDropTargetSignal, draggedChildSignal, type DropEdge } from "./child-drag-signals";

const ROW_HALF_DIVISOR = 2;

export type ChildDropHandler = (parentId: string, draggedId: string, targetId: string, edge: DropEdge) => void;

const edgeFromPointer = (event: React.DragEvent<HTMLElement>): DropEdge => {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientY < rect.top + rect.height / ROW_HALF_DIVISOR ? "above" : "below";
};

const isSiblingDrag = (layerId: string, parentId: string): boolean => {
  const dragged = draggedChildSignal.value;
  return dragged !== null && dragged.parentId === parentId && dragged.id !== layerId;
};

export const startChildDrag = (event: React.DragEvent<HTMLElement>, layerId: string, parentId: string): void => {
  event.stopPropagation();
  event.dataTransfer.effectAllowed = "move";
  draggedChildSignal.value = { id: layerId, parentId };
};

export const dragOverChild = (event: React.DragEvent<HTMLElement>, layerId: string, parentId: string): void => {
  if (!isSiblingDrag(layerId, parentId)) return;
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer.dropEffect = "move";
  const edge = edgeFromPointer(event);
  const current = childDropTargetSignal.value;
  if (current?.id !== layerId || current.edge !== edge) childDropTargetSignal.value = { id: layerId, edge };
};

export const endChildDrag = (): void => {
  draggedChildSignal.value = null;
  childDropTargetSignal.value = null;
};

export const dropOnChild = (event: React.DragEvent<HTMLElement>, layerId: string, parentId: string, onDrop: ChildDropHandler): void => {
  const dragged = draggedChildSignal.value;
  if (!dragged || !isSiblingDrag(layerId, parentId)) return;
  event.preventDefault();
  event.stopPropagation();
  onDrop(parentId, dragged.id, layerId, edgeFromPointer(event));
  endChildDrag();
};
