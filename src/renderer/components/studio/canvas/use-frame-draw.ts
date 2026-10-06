import { useCallback, useRef, useState } from "react";
import type { MarqueeRect } from "./use-marquee-select";
import type { FrameRect } from "../../../pages/studio-page/use-studio-pages";
import { DEFAULT_FRAME_PRESET } from "../../../utils/frame-presets";

interface UseFrameDrawArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  zoomContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  isActive: () => boolean;
  onAddFrame: (parentId: string | null, rect: FrameRect) => string;
  resolveDropTarget: (x: number, y: number) => string | null;
  onCreated: (id: string, parentId: string | null) => void;
}

const MIN_FRAME_DRAW = 8;
const INTERACTIVE = "button, input, select, textarea, [contenteditable], label, a";

export const useFrameDraw = ({
  wrapRef,
  zoomContainerRef,
  zoom,
  isActive,
  onAddFrame,
  resolveDropTarget,
  onCreated,
}: UseFrameDrawArgs) => {
  const startRef = useRef<
    { sx: number; sy: number; wl: number; wt: number; worldX: number; worldY: number } | null
  >(null);
  const capturedRef = useRef(false);
  const [previewRect, setPreviewRect] = useState<MarqueeRect | null>(null);

  const toWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const box = zoomContainerRef.current?.getBoundingClientRect();
      if (!box) return { x: 0, y: 0 };
      return { x: (clientX - box.left) / zoom, y: (clientY - box.top) / zoom };
    },
    [zoomContainerRef, zoom],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0 || !isActive()) return;
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const box = wrap.getBoundingClientRect();
      const world = toWorld(event.clientX, event.clientY);
      startRef.current = {
        sx: event.clientX,
        sy: event.clientY,
        wl: box.left,
        wt: box.top,
        worldX: world.x,
        worldY: world.y,
      };
      capturedRef.current = false;
    },
    [wrapRef, isActive, toWorld],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      if (event.buttons === 0) {
        startRef.current = null;
        capturedRef.current = false;
        return;
      }
      if (!capturedRef.current) {
        capturedRef.current = true;
        wrapRef.current?.setPointerCapture(event.pointerId);
      }
      let endX = event.clientX;
      let endY = event.clientY;
      if (event.shiftKey) {
        const side = Math.max(Math.abs(endX - start.sx), Math.abs(endY - start.sy));
        endX = start.sx + Math.sign(endX - start.sx || 1) * side;
        endY = start.sy + Math.sign(endY - start.sy || 1) * side;
      }
      setPreviewRect({
        left: Math.min(start.sx, endX) - start.wl,
        top: Math.min(start.sy, endY) - start.wt,
        width: Math.abs(endX - start.sx),
        height: Math.abs(endY - start.sy),
      });
    },
    [wrapRef],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      const start = startRef.current;
      if (!start) return;
      if (capturedRef.current) {
        wrapRef.current?.releasePointerCapture(event.pointerId);
        capturedRef.current = false;
      }
      startRef.current = null;
      setPreviewRect(null);

      const end = toWorld(event.clientX, event.clientY);
      const width = Math.abs(end.x - start.worldX);
      const height = Math.abs(end.y - start.worldY);
      const parentId = resolveDropTarget(start.worldX, start.worldY);

      if (width < MIN_FRAME_DRAW || height < MIN_FRAME_DRAW) {
        const id = onAddFrame(parentId, {
          x: Math.round(start.worldX),
          y: Math.round(start.worldY),
          width: DEFAULT_FRAME_PRESET.width,
          height: DEFAULT_FRAME_PRESET.height,
        });
        onCreated(id, parentId);
        return;
      }

      const id = onAddFrame(parentId, {
        x: Math.round(Math.min(start.worldX, end.x)),
        y: Math.round(Math.min(start.worldY, end.y)),
        width: Math.round(width),
        height: Math.round(height),
      });
      onCreated(id, parentId);
    },
    [wrapRef, toWorld, resolveDropTarget, onAddFrame, onCreated],
  );

  const cancel = useCallback(() => {
    startRef.current = null;
    capturedRef.current = false;
    setPreviewRect(null);
  }, []);

  return {
    framePreviewRect: previewRect,
    onFrameDrawPointerDown: onPointerDown,
    onFrameDrawPointerMove: onPointerMove,
    onFrameDrawPointerUp: onPointerUp,
    cancelFrameDraw: cancel,
  };
};
