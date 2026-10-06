import { useCallback, useRef } from "react";
import type { TemplatePage } from "../../../data/studioTypes";
import type { HandleDir } from "../layers/SelectionHandles";
import { isShiftHeld } from "../../../store/modifier-keys-store";
import { isAspectLocked } from "../../../store/aspect-lock-store";

const MIN_FRAME_SIZE = 50;

interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const resizeFrameAspect = (
  start: { x: number; y: number; w: number; h: number; dx: number; dy: number },
  dir: HandleDir,
): FrameRect => {
  const ratio = start.w / start.h;
  const signX = dir.includes("e") ? 1 : -1;
  const signY = dir.includes("s") ? 1 : -1;

  let w: number;
  let h: number;
  if (Math.abs(start.dx) * start.h >= Math.abs(start.dy) * start.w) {
    w = Math.max(MIN_FRAME_SIZE, start.w + signX * start.dx);
    h = w / ratio;
  } else {
    h = Math.max(MIN_FRAME_SIZE, start.h + signY * start.dy);
    w = h * ratio;
  }
  if (h < MIN_FRAME_SIZE) {
    h = MIN_FRAME_SIZE;
    w = h * ratio;
  }
  if (w < MIN_FRAME_SIZE) {
    w = MIN_FRAME_SIZE;
    h = w / ratio;
  }

  const x = dir.includes("w") ? start.x + (start.w - w) : start.x;
  const y = dir.includes("n") ? start.y + (start.h - h) : start.y;
  return { x, y, w, h };
};

export const usePageDrag = (
  zoomRef: React.MutableRefObject<number>,
  onPageMoveTo: (pageId: string, x: number, y: number) => void,
  onSelectFramePage: (id: string) => void,
  onPageMoveStart: () => void,
  onPageFrameTransform: ((pageId: string, x: number, y: number, width: number, height: number) => void) | undefined,
) => {
  const pageDragRef = useRef<{
    pageId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const pageResizeStartRef = useRef<{
    pageId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    dx: number;
    dy: number;
  } | null>(null);

  const handlePageTitlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, page: TemplatePage) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
      pageDragRef.current = {
        pageId: page.id,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: page.x,
        startY: page.y,
      };
      onSelectFramePage(page.id);
      onPageMoveStart();
    },
    [onPageMoveStart, onSelectFramePage],
  );

  const handlePageTitlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = pageDragRef.current;
      if (!drag) return;
      if (event.buttons === 0) {
        pageDragRef.current = null;
        return;
      }
      const dx = (event.clientX - drag.startClientX) / zoomRef.current;
      const dy = (event.clientY - drag.startClientY) / zoomRef.current;
      onPageMoveTo(drag.pageId, Math.round(drag.startX + dx), Math.round(drag.startY + dy));
    },
    [onPageMoveTo, zoomRef],
  );

  const handlePageTitlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!pageDragRef.current) return;
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      pageDragRef.current = null;
    },
    [],
  );

  const handlePageFrameResizeStart = useCallback((page: TemplatePage) => {
    pageResizeStartRef.current = {
      pageId: page.id, x: page.x, y: page.y, w: page.width, h: page.height, dx: 0, dy: 0,
    };
    onPageMoveStart();
  }, [onPageMoveStart]);

  const handlePageFrameResizeDelta = useCallback(
    (dir: HandleDir, deltaX: number, deltaY: number) => {
      const start = pageResizeStartRef.current;
      if (!start || !onPageFrameTransform) return;
      start.dx += deltaX;
      start.dy += deltaY;

      const isCorner = dir.length === 2;
      if (isCorner && (isAspectLocked() || isShiftHeld())) {
        const rect = resizeFrameAspect(start, dir);
        onPageFrameTransform(start.pageId, rect.x, rect.y, rect.w, rect.h);
        return;
      }

      let x = start.x;
      let y = start.y;
      let w = start.w;
      let h = start.h;
      if (dir.includes("e")) w = start.w + start.dx;
      if (dir.includes("s")) h = start.h + start.dy;
      if (dir.includes("w")) { x = start.x + start.dx; w = start.w - start.dx; }
      if (dir.includes("n")) { y = start.y + start.dy; h = start.h - start.dy; }
      if (w < MIN_FRAME_SIZE) {
        if (dir.includes("w")) x = start.x + (start.w - MIN_FRAME_SIZE);
        w = MIN_FRAME_SIZE;
      }
      if (h < MIN_FRAME_SIZE) {
        if (dir.includes("n")) y = start.y + (start.h - MIN_FRAME_SIZE);
        h = MIN_FRAME_SIZE;
      }
      onPageFrameTransform(start.pageId, x, y, w, h);
    },
    [onPageFrameTransform],
  );

  const handlePageFrameResizeEnd = useCallback(() => {
    pageResizeStartRef.current = null;
  }, []);

  return {
    handlePageTitlePointerDown,
    handlePageTitlePointerMove,
    handlePageTitlePointerUp,
    handlePageFrameResizeStart,
    handlePageFrameResizeDelta,
    handlePageFrameResizeEnd,
  };
};
