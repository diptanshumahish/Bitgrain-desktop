import React, { useCallback, useRef, useState } from "react";
import type { LayerPlacement } from "../../../data/studioTypes";
import type { PlacementTool } from "./use-canvas-tools";

const CLICK_THRESHOLD_PX = 6;

interface DragRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const computeRect = (
  start: { x: number; y: number },
  point: { x: number; y: number },
  constrain: boolean,
): DragRect => {
  let dx = point.x - start.x;
  let dy = point.y - start.y;
  if (constrain) {
    const size = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * size;
    dy = Math.sign(dy || 1) * size;
  }
  return {
    x: Math.min(start.x, start.x + dx),
    y: Math.min(start.y, start.y + dy),
    width: Math.abs(dx),
    height: Math.abs(dy),
  };
};

interface PlacementToolOverlayProps {
  tool: PlacementTool;
  canvasW: number;
  canvasH: number;
  zoom: number;
  isSpacePressed: () => boolean;
  onPlace: (placement: LayerPlacement) => void;
}

export const PlacementToolOverlay: React.FC<PlacementToolOverlayProps> = ({
  tool,
  canvasW,
  canvasH,
  zoom,
  isSpacePressed,
  onPlace,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [rect, setRect] = useState<DragRect | null>(null);

  const toCanvas = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const box = overlayRef.current!.getBoundingClientRect();
      return { x: (clientX - box.left) / zoom, y: (clientY - box.top) / zoom };
    },
    [zoom],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (isSpacePressed() || event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      overlayRef.current!.setPointerCapture(event.pointerId);
      pointerIdRef.current = event.pointerId;
      const point = toCanvas(event.clientX, event.clientY);
      startRef.current = point;
      setRect({ x: point.x, y: point.y, width: 0, height: 0 });
    },
    [isSpacePressed, toCanvas],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId || !startRef.current) return;
      const point = toCanvas(event.clientX, event.clientY);
      setRect(computeRect(startRef.current, point, event.shiftKey));
    },
    [toCanvas],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId || !startRef.current) return;
      event.stopPropagation();
      pointerIdRef.current = null;
      const point = toCanvas(event.clientX, event.clientY);
      const drag = computeRect(startRef.current, point, event.shiftKey);
      startRef.current = null;
      setRect(null);
      const dragged = drag.width > CLICK_THRESHOLD_PX || drag.height > CLICK_THRESHOLD_PX;
      onPlace({ ...drag, dragged });
    },
    [toCanvas, onPlace],
  );

  const previewClass =
    tool.kind === "shape" && tool.shapeType === "circle"
      ? "absolute border border-[var(--s-accent)] bg-[var(--s-accent)]/10 rounded-full pointer-events-none"
      : "absolute border border-[var(--s-accent)] bg-[var(--s-accent)]/10 pointer-events-none";

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[200] touch-none cursor-crosshair"
      style={{ width: canvasW, height: canvasH }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(event) => event.stopPropagation()}
    >
      {rect && (
        <div
          className={previewClass}
          style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
        />
      )}
    </div>
  );
};
