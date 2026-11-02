import { useEffect, useRef } from "react";
import { clampMobileZoom, mobileZoomSignal } from "./mobile-zoom-state";

const PINCH_TOUCH_COUNT = 2;

interface PinchStart {
  distance: number;
  zoom: number;
  midX: number;
  midY: number;
}

const touchDistance = (touches: TouchList): number =>
  Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY) || 1;

const touchMidpoint = (touches: TouchList): { x: number; y: number } => ({
  x: (touches[0].clientX + touches[1].clientX) / 2,
  y: (touches[0].clientY + touches[1].clientY) / 2,
});

const anchorScroll = (container: HTMLElement, ratio: number, mid: { x: number; y: number }, pan: { x: number; y: number }): void => {
  const rect = container.getBoundingClientRect();
  const localX = mid.x - rect.left;
  const localY = mid.y - rect.top;
  const anchorX = (container.scrollLeft + localX) * ratio - localX + pan.x;
  const anchorY = (container.scrollTop + localY) * ratio - localY + pan.y;
  requestAnimationFrame(() => container.scrollTo(anchorX, anchorY));
};

const readPinchStart = (touches: TouchList): PinchStart => {
  const mid = touchMidpoint(touches);
  return { distance: touchDistance(touches), zoom: mobileZoomSignal.value, midX: mid.x, midY: mid.y };
};

export const useMobilePinchZoom = (
  containerRef: React.RefObject<HTMLDivElement | null>,
): React.MutableRefObject<boolean> => {
  const pinchingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let start: PinchStart | null = null;

    const onTouchStart = (event: TouchEvent): void => {
      if (event.touches.length !== PINCH_TOUCH_COUNT) return;
      pinchingRef.current = true;
      start = readPinchStart(event.touches);
    };

    const onTouchMove = (event: TouchEvent): void => {
      if (!start || event.touches.length !== PINCH_TOUCH_COUNT) return;
      event.preventDefault();
      const mid = touchMidpoint(event.touches);
      const previousZoom = mobileZoomSignal.value;
      const nextZoom = clampMobileZoom(start.zoom * (touchDistance(event.touches) / start.distance));
      anchorScroll(container, nextZoom / previousZoom, mid, { x: start.midX - mid.x, y: start.midY - mid.y });
      mobileZoomSignal.value = nextZoom;
      start = { ...start, midX: mid.x, midY: mid.y };
    };

    const onTouchEnd = (event: TouchEvent): void => {
      if (event.touches.length < PINCH_TOUCH_COUNT) start = null;
      if (event.touches.length === 0) pinchingRef.current = false;
    };

    container.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    container.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    container.addEventListener("touchend", onTouchEnd, { capture: true });
    container.addEventListener("touchcancel", onTouchEnd, { capture: true });
    return () => {
      container.removeEventListener("touchstart", onTouchStart, { capture: true });
      container.removeEventListener("touchmove", onTouchMove, { capture: true });
      container.removeEventListener("touchend", onTouchEnd, { capture: true });
      container.removeEventListener("touchcancel", onTouchEnd, { capture: true });
    };
  }, [containerRef]);

  return pinchingRef;
};
