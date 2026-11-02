import { useLayoutEffect, useRef } from "react";

const ANCHOR_GAP_PX = 10;
const VIEWPORT_MARGIN_PX = 8;

interface Position {
  left: number;
  top: number;
}

const sideOf = (anchor: DOMRect, width: number): number => {
  const right = anchor.right + ANCHOR_GAP_PX;
  if (right + width <= window.innerWidth - VIEWPORT_MARGIN_PX) return right;
  return Math.max(VIEWPORT_MARGIN_PX, anchor.left - ANCHOR_GAP_PX - width);
};

const placeBeside = (anchor: DOMRect, popover: HTMLElement): Position => {
  const maxTop = window.innerHeight - popover.offsetHeight - VIEWPORT_MARGIN_PX;
  return {
    left: sideOf(anchor, popover.offsetWidth),
    top: Math.max(VIEWPORT_MARGIN_PX, Math.min(anchor.top, maxTop)),
  };
};

const applyPosition = (popover: HTMLElement, anchor: Element | null): void => {
  if (!anchor) {
    popover.style.visibility = "hidden";
    return;
  }
  const next = placeBeside(anchor.getBoundingClientRect(), popover);
  popover.style.visibility = "visible";
  popover.style.left = `${Math.round(next.left)}px`;
  popover.style.top = `${Math.round(next.top)}px`;
};

export const useFollowAnchor = (anchorSelector: string): React.RefObject<HTMLDivElement | null> => {
  const popoverRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let frame = 0;
    const tick = (): void => {
      const popover = popoverRef.current;
      if (popover) applyPosition(popover, document.querySelector(anchorSelector));
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [anchorSelector]);
  return popoverRef;
};
