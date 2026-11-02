import { useEffect } from "react";
import { resetMobileZoom, updateFitScale } from "./mobile-zoom-state";

const FIT_PADDING = 0.9;

export const useFitScale = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasW: number,
  canvasH: number,
): void => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = (): void => {
      const availW = container.clientWidth;
      const availH = container.clientHeight;
      if (availW === 0 || availH === 0 || canvasW === 0 || canvasH === 0) return;
      updateFitScale(Math.min(availW / canvasW, availH / canvasH) * FIT_PADDING);
    };
    resetMobileZoom();
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, canvasW, canvasH]);
};
