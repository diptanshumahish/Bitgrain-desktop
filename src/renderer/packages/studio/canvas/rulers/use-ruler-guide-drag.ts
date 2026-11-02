import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { makeGuideId, type GuideAxis } from "@bitgrain/studio-core/model/layout-grid-types";
import { emitPageAidsUpdate } from "../../state/canvas-aids/page-aids-event";
import { rulerDragPreviewSignal } from "../../state/canvas-aids/ruler-drag-preview";
import { selectGuide } from "../../state/canvas-aids/guide-selection";
import { RULER_SIZE_PX } from "./ruler-constants";

interface UseRulerGuideDragArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<{ x: number; y: number }>;
  zoomRef: React.MutableRefObject<number>;
  activePage: TemplatePage | undefined;
}

interface RulerPointerHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
}

const screenAlong = (wrap: HTMLDivElement, axis: GuideAxis, event: React.PointerEvent): number => {
  const rect = wrap.getBoundingClientRect();
  return axis === "x" ? event.clientX - rect.left : event.clientY - rect.top;
};

export const useRulerGuideDrag = (
  axis: GuideAxis,
  { wrapRef, panRef, zoomRef, activePage }: UseRulerGuideDragArgs,
): RulerPointerHandlers => {
  const draggingRef = useRef(false);
  const pageRef = useRef(activePage);

  useEffect(() => {
    pageRef.current = activePage;
  });

  const commitGuide = (screen: number): void => {
    const page = pageRef.current;
    if (!page || screen <= RULER_SIZE_PX) return;
    const pan = axis === "x" ? panRef.current.x : panRef.current.y;
    const pageOrigin = axis === "x" ? page.x : page.y;
    const position = Math.round((screen - pan) / zoomRef.current - pageOrigin);
    const guide = { id: makeGuideId(), axis, position };
    emitPageAidsUpdate({ pageId: page.id, patch: { guides: [...(page.guides ?? []), guide] }, recordHistory: true });
    selectGuide({ pageId: page.id, guideId: guide.id });
  };

  const onPointerDown = (event: React.PointerEvent): void => {
    if (event.button !== 0 || !pageRef.current) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
  };

  const onPointerMove = (event: React.PointerEvent): void => {
    const wrap = wrapRef.current;
    if (!draggingRef.current || !wrap) return;
    rulerDragPreviewSignal.value = { axis, screen: screenAlong(wrap, axis, event) };
  };

  const onPointerUp = (event: React.PointerEvent): void => {
    const wrap = wrapRef.current;
    if (!draggingRef.current || !wrap) return;
    draggingRef.current = false;
    rulerDragPreviewSignal.value = null;
    commitGuide(screenAlong(wrap, axis, event));
  };

  return { onPointerDown, onPointerMove, onPointerUp };
};
