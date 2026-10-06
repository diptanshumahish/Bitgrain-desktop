import { useRef } from "react";
import type { GroupLayer, Layer } from "../../../data/studioTypes";
import { reorderByPointer, type ChildFrame } from "../../../utils/auto-layout";

interface GroupReorder {
  dragReorder: (childId: string, dx: number, dy: number) => void;
  handleMoveEnd: () => void;
}

export const useGroupReorder = (
  layer: GroupLayer,
  frames: ChildFrame[] | null,
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void,
  onMoveEnd: () => void,
): GroupReorder => {
  const pointerRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const frameById = new Map<string, ChildFrame>((frames ?? []).map((frame) => [frame.id, frame]));

  const dragReorder = (childId: string, dx: number, dy: number): void => {
    if (!frames) return;
    const frame = frameById.get(childId);
    if (!frame) return;
    const active = pointerRef.current;
    const pointer =
      !active || active.id !== childId
        ? { id: childId, x: frame.x + frame.width / 2 + dx, y: frame.y + frame.height / 2 + dy }
        : { id: childId, x: active.x + dx, y: active.y + dy };
    pointerRef.current = pointer;
    const next = reorderByPointer(layer, frames, childId, pointer.x, pointer.y);
    if (next) onLayerUpdate(layer.id, { layers: next });
  };

  const handleMoveEnd = (): void => {
    pointerRef.current = null;
    onMoveEnd();
  };

  return { dragReorder, handleMoveEnd };
};
