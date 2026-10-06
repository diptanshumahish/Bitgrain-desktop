import { useCallback, useRef, useState } from "react";
import type { ShapeType, TemplatePage } from "../../../data/studioTypes";
import type { PlacementTool as CanvasPlacementTool } from "./use-canvas-tools";

// UNUSED since the 2026-10 web re-sync: the studio canvas now uses the web
// placement-tool overlay and F-key frame drawing. Kept only until it is deleted.
type PlacementTool = CanvasPlacementTool | { kind: "frame" };
import type { MarqueeRect } from "./use-marquee-select";

interface UsePlacementToolArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  zoomContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  placementTool: PlacementTool | null;
  pages: TemplatePage[];
  activePageId: string;
  onCreateShape: (pageId: string, shapeType: ShapeType, x: number, y: number, w: number, h: number) => void;
  onCreateText: (pageId: string, x: number, y: number) => void;
  onCreateFrame: (x: number, y: number, w: number, h: number) => void;
  onComplete: () => void;
}

// A press-and-drag on the canvas that drops a shape/text/frame at the drawn rect
// (Figma-style). A near-zero drag falls back to a default size at the click point.
// Screen→world conversion and the drag-rect overlay mirror use-marquee-select.
const MIN_DRAG_PX = 4;

const DEFAULT_SIZE = {
  shape: { w: 120, h: 120 },
  line: { w: 160, h: 20 },
  text: { w: 240, h: 80 },
  frame: { w: 1080, h: 1080 },
};

export const usePlacementTool = ({
  wrapRef,
  zoomContainerRef,
  zoom,
  placementTool,
  pages,
  activePageId,
  onCreateShape,
  onCreateText,
  onCreateFrame,
  onComplete,
}: UsePlacementToolArgs) => {
  const startRef = useRef<{ sx: number; sy: number; wx: number; wy: number } | null>(null);
  const capturedRef = useRef(false);
  const [rect, setRect] = useState<MarqueeRect | null>(null);

  const toWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const box = zoomContainerRef.current?.getBoundingClientRect();
      if (!box) return { x: 0, y: 0 };
      return { x: (clientX - box.left) / zoom, y: (clientY - box.top) / zoom };
    },
    [zoomContainerRef, zoom],
  );

  const findPageAt = useCallback(
    (wx: number, wy: number): TemplatePage | undefined =>
      pages.find(
        (page) =>
          wx >= page.x && wx <= page.x + page.width && wy >= page.y && wy <= page.y + page.height,
      ),
    [pages],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!placementTool || event.button !== 0) return;
      const world = toWorld(event.clientX, event.clientY);
      startRef.current = { sx: event.clientX, sy: event.clientY, wx: world.x, wy: world.y };
      capturedRef.current = false;
      try {
        wrapRef.current?.setPointerCapture(event.pointerId);
      } catch {
        /* pointer may already be released; capture is best-effort */
      }
    },
    [placementTool, toWorld, wrapRef],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const moved =
        Math.abs(event.clientX - start.sx) > MIN_DRAG_PX ||
        Math.abs(event.clientY - start.sy) > MIN_DRAG_PX;
      if (!moved && !capturedRef.current) return;
      capturedRef.current = true;
      const box = wrap.getBoundingClientRect();
      setRect({
        left: Math.min(start.sx, event.clientX) - box.left,
        top: Math.min(start.sy, event.clientY) - box.top,
        width: Math.abs(event.clientX - start.sx),
        height: Math.abs(event.clientY - start.sy),
      });
    },
    [wrapRef],
  );

  const finish = useCallback(
    (event: React.PointerEvent) => {
      const start = startRef.current;
      startRef.current = null;
      setRect(null);
      if (capturedRef.current) {
        try {
          wrapRef.current?.releasePointerCapture(event.pointerId);
        } catch {
          /* capture may not be held; release is best-effort */
        }
        capturedRef.current = false;
      }
      if (!start || !placementTool) return;

      const dragged =
        Math.abs(event.clientX - start.sx) > MIN_DRAG_PX ||
        Math.abs(event.clientY - start.sy) > MIN_DRAG_PX;

      const end = toWorld(event.clientX, event.clientY);
      let left: number;
      let top: number;
      let width: number;
      let height: number;

      if (dragged) {
        left = Math.min(start.wx, end.x);
        top = Math.min(start.wy, end.y);
        width = Math.abs(end.x - start.wx);
        height = Math.abs(end.y - start.wy);
      } else {
        const isLine =
          placementTool.kind === "shape" &&
          (placementTool.shapeType === "line" || placementTool.shapeType === "arrow");
        const size =
          placementTool.kind === "frame"
            ? DEFAULT_SIZE.frame
            : placementTool.kind === "text"
              ? DEFAULT_SIZE.text
              : isLine
                ? DEFAULT_SIZE.line
                : DEFAULT_SIZE.shape;
        left = start.wx;
        top = start.wy;
        width = size.w;
        height = size.h;
      }

      if (placementTool.kind === "frame") {
        onCreateFrame(left, top, width, height);
        onComplete();
        return;
      }

      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const page = findPageAt(centerX, centerY) ?? pages.find((p) => p.id === activePageId) ?? pages[0];
      if (!page) {
        onComplete();
        return;
      }
      const localX = left - page.x;
      const localY = top - page.y;
      if (placementTool.kind === "text") {
        onCreateText(page.id, localX, localY);
      } else {
        onCreateShape(page.id, placementTool.shapeType, localX, localY, width, height);
      }
      onComplete();
    },
    [placementTool, toWorld, findPageAt, pages, activePageId, onCreateShape, onCreateText, onCreateFrame, onComplete, wrapRef],
  );

  return {
    placementRect: rect,
    onPlacementPointerDown: onPointerDown,
    onPlacementPointerMove: onPointerMove,
    onPlacementPointerUp: finish,
  };
};
