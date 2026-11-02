import { useCallback } from "react";

const OFFSCREEN_ATTRIBUTE = "data-offscreen";
const VISIBLE_THRESHOLD = 0.25;

export const useOffscreenPause = (): ((element: HTMLElement | null) => (() => void) | undefined) =>
  useCallback((element: HTMLElement | null) => {
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => element.toggleAttribute(OFFSCREEN_ATTRIBUTE, !entry.isIntersecting),
      { threshold: VISIBLE_THRESHOLD },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
