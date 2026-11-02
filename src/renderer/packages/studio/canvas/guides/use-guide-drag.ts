import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { PageGuide } from "@bitgrain/studio-core/model/layout-grid-types";
import { emitPageAidsUpdate } from "../../state/canvas-aids/page-aids-event";
import { selectGuide } from "../../state/canvas-aids/guide-selection";
import { isOverRuler, moveGuide, removeGuide } from "./guide-list-ops";

interface DragSession {
  guide: PageGuide;
  startClient: number;
  moved: boolean;
}

export interface GuideDragHandlers {
  onPointerDown: (event: React.PointerEvent, guide: PageGuide) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
}

const clientAlong = (guide: PageGuide, event: React.PointerEvent): number =>
  guide.axis === "x" ? event.clientX : event.clientY;

export const useGuideDrag = (page: TemplatePage, zoom: number): GuideDragHandlers => {
  const sessionRef = useRef<DragSession | null>(null);
  const pageRef = useRef(page);

  useEffect(() => {
    pageRef.current = page;
  });

  const writeGuides = (guides: PageGuide[], recordHistory: boolean): void =>
    emitPageAidsUpdate({ pageId: pageRef.current.id, patch: { guides }, recordHistory });

  const onPointerDown = (event: React.PointerEvent, guide: PageGuide): void => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    selectGuide({ pageId: pageRef.current.id, guideId: guide.id });
    sessionRef.current = { guide, startClient: clientAlong(guide, event), moved: false };
  };

  const onPointerMove = (event: React.PointerEvent): void => {
    const session = sessionRef.current;
    if (!session) return;
    const delta = (clientAlong(session.guide, event) - session.startClient) / zoom;
    const position = Math.round(session.guide.position + delta);
    writeGuides(moveGuide(pageRef.current.guides ?? [], session.guide.id, position), !session.moved);
    session.moved = true;
  };

  const onPointerUp = (event: React.PointerEvent): void => {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (!session?.moved || !isOverRuler(event.clientX, event.clientY)) return;
    writeGuides(removeGuide(pageRef.current.guides ?? [], session.guide.id), false);
    selectGuide(null);
  };

  return { onPointerDown, onPointerMove, onPointerUp };
};
