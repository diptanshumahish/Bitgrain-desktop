import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyTransform,
  TRACKPAD_DELTA_THRESHOLD,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_MOUSE_SENSITIVITY,
  ZOOM_TRACKPAD_SENSITIVITY,
} from "./canvas-transform";

export const useCanvasPanZoom = (
  zoom: number,
  onZoomChange: (z: number) => void,
  wrapRef: React.RefObject<HTMLDivElement | null>,
  panContainerRef: React.RefObject<HTMLDivElement | null>,
  zoomContainerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const didPanRef = useRef(false);
  const isSpaceRef = useRef(false);
  const isSpacePressedRef = useRef(false);
  const grabModeRef = useRef(false);
  const zoomFlushRef = useRef<number | null>(null);
  const [isSpaceActive, setIsSpaceActive] = useState(false);
  const [grabMode, setGrabMode] = useState(false);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const cancelDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const scheduleZoomFlush = useCallback(() => {
    if (zoomFlushRef.current !== null) return;
    zoomFlushRef.current = requestAnimationFrame(() => {
      zoomFlushRef.current = null;
      onZoomChange(zoomRef.current);
    });
  }, [onZoomChange]);

  useEffect(() => {
    return () => {
      if (zoomFlushRef.current !== null) cancelAnimationFrame(zoomFlushRef.current);
    };
  }, []);
  useEffect(() => {
    grabModeRef.current = grabMode;
    const wrap = wrapRef.current;
    if (wrap && !dragRef.current) {
      wrap.style.cursor = grabMode ? "grab" : "";
    }
  }, [grabMode, wrapRef]);

  const handleWheel = useCallback((event: WheelEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const curZoom = zoomRef.current;
      const sensitivity =
        Math.abs(event.deltaY) < TRACKPAD_DELTA_THRESHOLD
          ? ZOOM_TRACKPAD_SENSITIVITY
          : ZOOM_MOUSE_SENSITIVITY;
      const factor = Math.exp(-event.deltaY * sensitivity);
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, curZoom * factor));
      if (newZoom === curZoom) return;

      const rect = wrap.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const worldX = (mouseX - panRef.current.x) / curZoom;
      const worldY = (mouseY - panRef.current.y) / curZoom;
      const nextX = mouseX - worldX * newZoom;
      const nextY = mouseY - worldY * newZoom;

      panRef.current = { x: nextX, y: nextY };
      zoomRef.current = newZoom;
      applyTransform(panContainerRef.current, zoomContainerRef.current, wrapRef.current, nextX, nextY, newZoom);
      scheduleZoomFlush();
      return;
    }

    event.preventDefault();
    const nextX = panRef.current.x - event.deltaX;
    const nextY = panRef.current.y - event.deltaY;
    panRef.current = { x: nextX, y: nextY };
    applyTransform(panContainerRef.current, zoomContainerRef.current, wrapRef.current, nextX, nextY, zoomRef.current);
  }, [scheduleZoomFlush, wrapRef, panContainerRef, zoomContainerRef]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("button, input, select, textarea, [contenteditable], label")) return;
      if (event.button !== 1 && !(event.button === 0 && (isSpaceRef.current || grabModeRef.current))) return;
      event.preventDefault();
      event.stopPropagation();
      wrap.setPointerCapture(event.pointerId);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      wrap.style.cursor = "grabbing";
      wrap.style.userSelect = "none";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didPanRef.current = true;
      const nextX = dragRef.current.panX + dx;
      const nextY = dragRef.current.panY + dy;
      panRef.current = { x: nextX, y: nextY };
      applyTransform(panContainerRef.current, zoomContainerRef.current, wrapRef.current, nextX, nextY, zoomRef.current);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragRef.current) return;
      wrap.releasePointerCapture(event.pointerId);
      dragRef.current = null;
      wrap.style.cursor = isSpaceRef.current || grabModeRef.current ? "grab" : "";
      wrap.style.userSelect = "";
    };

    wrap.addEventListener("wheel", handleWheel, { passive: false });
    wrap.addEventListener("pointerdown", onPointerDown, { capture: true });
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", onPointerUp);
    return () => {
      wrap.removeEventListener("wheel", handleWheel);
      wrap.removeEventListener("pointerdown", onPointerDown, { capture: true });
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", onPointerUp);
    };
  }, [handleWheel, wrapRef, panContainerRef, zoomContainerRef]);

  return {
    panRef,
    zoomRef,
    dragRef,
    didPanRef,
    isSpaceRef,
    isSpacePressedRef,
    grabModeRef,
    isSpaceActive,
    setIsSpaceActive,
    grabMode,
    setGrabMode,
    cancelDrag,
  };
};
