import { useRef, type DragEvent } from "react";
import { studioPagesSignal } from "../../../../state/studio-document-store";
import { emitSlideSorterAction } from "../state/slide-sorter-actions";
import { setSorterSelection, sorterDropIndexSignal, sorterSelectionSignal } from "../state/slide-sorter-store";
import { orderedIds } from "../state/page-list-ops";

export interface SorterDragHandlers {
  onDragStart: (event: DragEvent<HTMLElement>, pageId: string) => void;
  onDragOver: (event: DragEvent<HTMLElement>, index: number) => void;
  onDragOverEnd: (event: DragEvent<HTMLElement>, pageCount: number) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

const HALF = 2;

const insertIndexFor = (event: DragEvent<HTMLElement>, index: number): number => {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX > rect.left + rect.width / HALF ? index + 1 : index;
};

export const useSorterDrag = (): SorterDragHandlers => {
  const movingRef = useRef<string[]>([]);

  const onDragStart = (event: DragEvent<HTMLElement>, pageId: string): void => {
    const selection = sorterSelectionSignal.value;
    const moving = selection.includes(pageId) ? orderedIds(studioPagesSignal.value, selection) : [pageId];
    movingRef.current = moving;
    setSorterSelection(moving);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", pageId);
  };

  const onDragOver = (event: DragEvent<HTMLElement>, index: number): void => {
    if (movingRef.current.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    sorterDropIndexSignal.value = insertIndexFor(event, index);
  };

  const onDragOverEnd = (event: DragEvent<HTMLElement>, pageCount: number): void => {
    if (movingRef.current.length === 0) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    sorterDropIndexSignal.value = pageCount;
  };

  const onDragEnd = (): void => {
    movingRef.current = [];
    sorterDropIndexSignal.value = null;
  };

  const onDrop = (event: DragEvent<HTMLElement>): void => {
    const insertIndex = sorterDropIndexSignal.value;
    event.preventDefault();
    if (insertIndex !== null && movingRef.current.length > 0) {
      emitSlideSorterAction({ kind: "reorder", pageIds: movingRef.current, insertIndex });
    }
    onDragEnd();
  };

  return { onDragStart, onDragOver, onDragOverEnd, onDrop, onDragEnd };
};
