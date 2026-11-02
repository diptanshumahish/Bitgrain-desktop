import { useRef } from "react";
import { moveThreadPin } from "../comments/comment-edit-actions";
import type { ProjectComment } from "../api/share-types";
import { emitPinPreview } from "../comment-state/comment-popover-events";
import { pointInSurface, SURFACE_SELECTOR, toPercent, type PagePoint } from "./pin-geometry";

const DRAG_THRESHOLD_PX = 3;

interface PinDragHandlers {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const movedPastThreshold = (start: PagePoint, event: React.PointerEvent): boolean =>
  Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_THRESHOLD_PX;

export const usePinDrag = (root: ProjectComment, onTap: () => void): PinDragHandlers => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<PagePoint | null>(null);
  const dropRef = useRef<PagePoint | null>(null);

  const dragTo = (event: React.PointerEvent<HTMLButtonElement>): void => {
    const wrapper = wrapperRef.current;
    const surface = wrapper?.closest(SURFACE_SELECTOR);
    if (!wrapper || !surface) return;
    if (!dropRef.current) emitPinPreview(null);
    dropRef.current = pointInSurface(surface, event.clientX, event.clientY);
    wrapper.style.left = toPercent(dropRef.current.x);
    wrapper.style.top = toPercent(dropRef.current.y);
  };

  return {
    wrapperRef,
    onPointerDown: (event) => {
      event.stopPropagation();
      if (event.button !== 0) return;
      startRef.current = { x: event.clientX, y: event.clientY };
      dropRef.current = null;
      if (root.canEdit) event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const start = startRef.current;
      if (!start || !root.canEdit || (!dropRef.current && !movedPastThreshold(start, event))) return;
      dragTo(event);
    },
    onPointerUp: () => {
      if (!startRef.current) return;
      startRef.current = null;
      const drop = dropRef.current;
      if (drop) void moveThreadPin(root, drop.x, drop.y);
      else onTap();
    },
    onClick: (event) => event.stopPropagation(),
  };
};
