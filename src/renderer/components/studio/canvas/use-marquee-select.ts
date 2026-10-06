import { useCallback, useRef, useState } from "react";
import type { TemplatePage } from "../../../data/studioTypes";

export interface MarqueeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UseMarqueeSelectArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  zoomContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  activePage: TemplatePage | undefined;
  isDisabled: () => boolean;
  didMarqueeRef: React.MutableRefObject<boolean>;
  onSelectIds: (ids: string[]) => void;
}

const MIN_DRAG_PX = 3;
const INTERACTIVE = "button, input, select, textarea, [contenteditable], label, a";

export const useMarqueeSelect = ({
  wrapRef,
  zoomContainerRef,
  zoom,
  activePage,
  isDisabled,
  didMarqueeRef,
  onSelectIds,
}: UseMarqueeSelectArgs) => {
  const startRef = useRef<{ sx: number; sy: number; wl: number; wt: number } | null>(null);
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

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0 || isDisabled()) return;
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const box = wrap.getBoundingClientRect();
      startRef.current = { sx: event.clientX, sy: event.clientY, wl: box.left, wt: box.top };
      capturedRef.current = false;
    },
    [wrapRef, isDisabled],
  );

  const selectInRange = useCallback(
    (clientX: number, clientY: number, start: { sx: number; sy: number }) => {
      if (!activePage) return;
      const a = toWorld(start.sx, start.sy);
      const b = toWorld(clientX, clientY);
      const left = Math.min(a.x, b.x);
      const right = Math.max(a.x, b.x);
      const top = Math.min(a.y, b.y);
      const bottom = Math.max(a.y, b.y);

      const ids = activePage.layers
        .filter((layer) => {
          if (layer.visible === false || layer.locked) return false;
          const lx = activePage.x + layer.x;
          const ly = activePage.y + layer.y;
          return !(right < lx || bottom < ly || left > lx + layer.width || top > ly + layer.height);
        })
        .map((layer) => layer.id);

      onSelectIds(ids);
    },
    [activePage, toWorld, onSelectIds],
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
      const moved =
        Math.abs(event.clientX - start.sx) > MIN_DRAG_PX ||
        Math.abs(event.clientY - start.sy) > MIN_DRAG_PX;
      if (!moved && !capturedRef.current) return;
      if (!capturedRef.current) {
        capturedRef.current = true;
        didMarqueeRef.current = true;
        wrapRef.current?.setPointerCapture(event.pointerId);
      }
      setRect({
        left: Math.min(start.sx, event.clientX) - start.wl,
        top: Math.min(start.sy, event.clientY) - start.wt,
        width: Math.abs(event.clientX - start.sx),
        height: Math.abs(event.clientY - start.sy),
      });
      selectInRange(event.clientX, event.clientY, start);
    },
    [didMarqueeRef, selectInRange, wrapRef],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!startRef.current) return;
      if (capturedRef.current) {
        wrapRef.current?.releasePointerCapture(event.pointerId);
        capturedRef.current = false;
      }
      startRef.current = null;
      setRect(null);
    },
    [wrapRef],
  );

  const cancel = useCallback(() => {
    startRef.current = null;
    capturedRef.current = false;
    setRect(null);
  }, []);

  return { marqueeRect: rect, onMarqueePointerDown: onPointerDown, onMarqueePointerMove: onPointerMove, onMarqueePointerUp: onPointerUp, cancel };
};
