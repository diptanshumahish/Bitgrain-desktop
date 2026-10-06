import { useCallback, useEffect, useRef } from "react";
import { applyTransform, ZOOM_MAX, ZOOM_MIN } from "./canvas-transform";

interface TouchPoint {
  clientX: number;
  clientY: number;
}

interface GestureState {
  startDistance: number;
  worldX: number;
  worldY: number;
}

interface SafariGestureState {
  startZoom: number;
  worldX: number;
  worldY: number;
}

interface SafariGestureEvent extends Event {
  readonly scale: number;
  readonly clientX: number;
  readonly clientY: number;
}

const distanceBetween = (a: TouchPoint, b: TouchPoint): number => {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
};

const midpointBetween = (a: TouchPoint, b: TouchPoint): TouchPoint => ({
  clientX: (a.clientX + b.clientX) / 2,
  clientY: (a.clientY + b.clientY) / 2,
});

export const useCanvasTouchGesture = (
  wrapRef: React.RefObject<HTMLDivElement | null>,
  panContainerRef: React.RefObject<HTMLDivElement | null>,
  zoomContainerRef: React.RefObject<HTMLDivElement | null>,
  panRef: React.MutableRefObject<{ x: number; y: number }>,
  zoomRef: React.MutableRefObject<number>,
  onZoomChange: (z: number) => void,
  onGestureStart: () => void,
) => {
  const gestureRef = useRef<GestureState | null>(null);
  const safariGestureRef = useRef<SafariGestureState | null>(null);
  const flushRef = useRef<number | null>(null);

  const scheduleFlush = useCallback(() => {
    if (flushRef.current !== null) return;
    flushRef.current = requestAnimationFrame(() => {
      flushRef.current = null;
      onZoomChange(zoomRef.current);
    });
  }, [onZoomChange, zoomRef]);

  useEffect(() => {
    return () => {
      if (flushRef.current !== null) cancelAnimationFrame(flushRef.current);
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const beginGesture = (first: TouchPoint, second: TouchPoint) => {
      const rect = wrap.getBoundingClientRect();
      const mid = midpointBetween(first, second);
      const midX = mid.clientX - rect.left;
      const midY = mid.clientY - rect.top;
      const zoom = zoomRef.current;
      gestureRef.current = {
        startDistance: distanceBetween(first, second) || 1,
        worldX: (midX - panRef.current.x) / zoom,
        worldY: (midY - panRef.current.y) / zoom,
      };
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length < 2) return;
      event.preventDefault();
      onGestureStart();
      beginGesture(event.touches[0], event.touches[1]);
    };

    const onTouchMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture || event.touches.length < 2) return;
      event.preventDefault();

      const rect = wrap.getBoundingClientRect();
      const first = event.touches[0];
      const second = event.touches[1];
      const mid = midpointBetween(first, second);
      const midX = mid.clientX - rect.left;
      const midY = mid.clientY - rect.top;

      const scale = distanceBetween(first, second) / gesture.startDistance;
      const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current * scale));
      const nextX = midX - gesture.worldX * nextZoom;
      const nextY = midY - gesture.worldY * nextZoom;

      panRef.current = { x: nextX, y: nextY };
      zoomRef.current = nextZoom;
      gestureRef.current = {
        ...gesture,
        startDistance: distanceBetween(first, second) || gesture.startDistance,
        worldX: (midX - nextX) / nextZoom,
        worldY: (midY - nextY) / nextZoom,
      };
      applyTransform(panContainerRef.current, zoomContainerRef.current, wrap, nextX, nextY, nextZoom);
      scheduleFlush();
    };

    const endGesture = (event: TouchEvent) => {
      if (event.touches.length >= 2) return;
      if (!gestureRef.current) return;
      gestureRef.current = null;
      onZoomChange(zoomRef.current);
    };

    const onSafariGestureStart = (event: Event) => {
      event.preventDefault();
      if (gestureRef.current) return;
      const gestureEvent = event as SafariGestureEvent;
      const rect = wrap.getBoundingClientRect();
      const midX = gestureEvent.clientX - rect.left;
      const midY = gestureEvent.clientY - rect.top;
      const zoom = zoomRef.current;
      onGestureStart();
      safariGestureRef.current = {
        startZoom: zoom,
        worldX: (midX - panRef.current.x) / zoom,
        worldY: (midY - panRef.current.y) / zoom,
      };
    };

    const onSafariGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = safariGestureRef.current;
      if (!gesture) return;
      const gestureEvent = event as SafariGestureEvent;
      const rect = wrap.getBoundingClientRect();
      const midX = gestureEvent.clientX - rect.left;
      const midY = gestureEvent.clientY - rect.top;
      const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, gesture.startZoom * gestureEvent.scale));
      const nextX = midX - gesture.worldX * nextZoom;
      const nextY = midY - gesture.worldY * nextZoom;

      panRef.current = { x: nextX, y: nextY };
      zoomRef.current = nextZoom;
      applyTransform(panContainerRef.current, zoomContainerRef.current, wrap, nextX, nextY, nextZoom);
      scheduleFlush();
    };

    const onSafariGestureEnd = (event: Event) => {
      event.preventDefault();
      if (!safariGestureRef.current) return;
      safariGestureRef.current = null;
      onZoomChange(zoomRef.current);
    };

    wrap.addEventListener("touchstart", onTouchStart, { passive: false });
    wrap.addEventListener("touchmove", onTouchMove, { passive: false });
    wrap.addEventListener("touchend", endGesture);
    wrap.addEventListener("touchcancel", endGesture);
    wrap.addEventListener("gesturestart", onSafariGestureStart, { passive: false });
    wrap.addEventListener("gesturechange", onSafariGestureChange, { passive: false });
    wrap.addEventListener("gestureend", onSafariGestureEnd, { passive: false });
    return () => {
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("touchend", endGesture);
      wrap.removeEventListener("touchcancel", endGesture);
      wrap.removeEventListener("gesturestart", onSafariGestureStart);
      wrap.removeEventListener("gesturechange", onSafariGestureChange);
      wrap.removeEventListener("gestureend", onSafariGestureEnd);
    };
  }, [wrapRef, panContainerRef, zoomContainerRef, panRef, zoomRef, onZoomChange, onGestureStart, scheduleFlush]);
};
