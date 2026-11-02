import { useCallback } from "react";
import type { useFrameDraw } from "../use-frame-draw";
import type { useMarqueeSelect } from "../use-marquee-select";
import { isDrawingToolActive, type CanvasPanZoom, type CanvasTools } from "./canvas-tool-types";

const WRAP_CHROME_SELECTOR =
  "button, input, select, textarea, [contenteditable], label, a, [data-popover-root]";
const PRIMARY_BUTTON = 0;

interface WrapPointerInput {
  panZoom: CanvasPanZoom;
  tools: CanvasTools;
  marquee: ReturnType<typeof useMarqueeSelect>;
  frameDraw: ReturnType<typeof useFrameDraw>;
  didMarqueeRef: React.MutableRefObject<boolean>;
  vectorEditingId: string | null;
  onEndVectorEdit: () => void;
  onSelectLayer: (id: string | null) => void;
}

interface WrapPointerHandlers {
  onClick: () => void;
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
}

export const useWrapPointer = ({
  panZoom, tools, marquee, frameDraw, didMarqueeRef, vectorEditingId, onEndVectorEdit, onSelectLayer,
}: WrapPointerInput): WrapPointerHandlers => {
  const { didPanRef } = panZoom;
  const onClick = useCallback((): void => {
    didMarqueeRef.current = false;
    didPanRef.current = false;
  }, [didMarqueeRef, didPanRef]);

  const onPointerDown = useCallback((event: React.PointerEvent): void => {
    frameDraw.onFrameDrawPointerDown(event);
    marquee.onMarqueePointerDown(event);
    if (event.button !== PRIMARY_BUTTON) return;
    if (panZoom.grabMode || panZoom.isSpaceRef.current || isDrawingToolActive(tools)) return;
    if ((event.target as HTMLElement).closest(WRAP_CHROME_SELECTOR)) return;
    if (vectorEditingId) {
      onEndVectorEdit();
      return;
    }
    onSelectLayer(null);
  }, [frameDraw, marquee, panZoom, tools, vectorEditingId, onEndVectorEdit, onSelectLayer]);

  const onPointerMove = useCallback((event: React.PointerEvent): void => {
    marquee.onMarqueePointerMove(event);
    frameDraw.onFrameDrawPointerMove(event);
  }, [marquee, frameDraw]);

  const onPointerUp = useCallback((event: React.PointerEvent): void => {
    marquee.onMarqueePointerUp(event);
    frameDraw.onFrameDrawPointerUp(event);
  }, [marquee, frameDraw]);

  return { onClick, onPointerDown, onPointerMove, onPointerUp };
};
