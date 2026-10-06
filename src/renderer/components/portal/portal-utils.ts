import { useEffect } from "react";

export const VIEWPORT_MARGIN = 8;

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const clampToViewport = (
  box: Box,
  margin: number = VIEWPORT_MARGIN,
): { top: number; left: number } => {
  let { top, left } = box;
  if (top < margin) top = margin;
  if (top + box.height > window.innerHeight - margin) {
    top = window.innerHeight - box.height - margin;
  }
  if (left < margin) left = margin;
  if (left + box.width > window.innerWidth - margin) {
    left = window.innerWidth - box.width - margin;
  }
  return { top, left };
};

export const useClickOutsideClose = (
  active: boolean,
  refs: React.RefObject<HTMLElement | null>[],
  onClose: () => void,
): void => {
  useEffect(() => {
    if (!active) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      for (const ref of refs) {
        if (ref.current && ref.current.contains(target)) return;
      }
      onClose();
    };
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
    // refs / onClose identity is stable enough for this trap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
};
