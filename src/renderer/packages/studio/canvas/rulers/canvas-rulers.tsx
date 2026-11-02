import React, { useMemo } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { selectionBounds } from "../zoom/selection-bounds";
import { useRulerPaint } from "./use-ruler-paint";
import { useRulerGuideDrag } from "./use-ruler-guide-drag";
import { RulerDragPreviewLine } from "./ruler-drag-preview-line";

interface CanvasRulersProps {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<{ x: number; y: number }>;
  zoomRef: React.MutableRefObject<number>;
  pages: TemplatePage[];
  activePage: TemplatePage | undefined;
  selectedIds: string[];
}

export const CanvasRulers = ({ wrapRef, panRef, zoomRef, pages, activePage, selectedIds }: CanvasRulersProps): React.ReactElement => {
  const selection = useMemo(() => selectionBounds(pages, selectedIds), [pages, selectedIds]);
  const source = useMemo(
    () => ({ page: activePage ? { x: activePage.x, y: activePage.y } : null, selection }),
    [activePage, selection],
  );
  const { topRef, leftRef } = useRulerPaint({ wrapRef, panRef, zoomRef, source });
  const dragArgs = { wrapRef, panRef, zoomRef, activePage };
  const topDrag = useRulerGuideDrag("y", dragArgs);
  const leftDrag = useRulerGuideDrag("x", dragArgs);

  return (
    <>
      <canvas
        ref={topRef}
        data-canvas-ruler="top"
        className="absolute top-0 left-0 right-0 h-5 w-full z-[65] cursor-row-resize touch-none"
        {...topDrag}
      />
      <canvas
        ref={leftRef}
        data-canvas-ruler="left"
        className="absolute top-0 left-0 bottom-0 w-5 h-full z-[65] cursor-col-resize touch-none"
        {...leftDrag}
      />
      <div data-canvas-ruler="corner" className="absolute top-0 left-0 w-5 h-5 z-[66] bg-[var(--s-bg-panel)] border-r border-b border-[var(--s-border)]" />
      <RulerDragPreviewLine />
    </>
  );
};
