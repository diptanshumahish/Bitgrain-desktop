import { useEffect, type RefObject } from "react";
import { pointInElement } from "../shared/point";
import { prefersReducedMotion } from "../shared/reduced-motion";
import { createLensRenderer } from "./lens-renderer";

const LENS_AREA_SELECTOR = "[data-lens-area]";

export const useHalftoneLens = (canvasRef: RefObject<HTMLCanvasElement | null>, src: string, cell: number, color: string): void => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const area = canvas.closest<HTMLElement>(LENS_AREA_SELECTOR) ?? canvas.parentElement;
    const renderer = createLensRenderer(canvas, cell, color);
    const image = new Image();
    const rebuild = (): void => renderer.rebuild(image);
    const onMove = (event: PointerEvent): void => {
      if (!prefersReducedMotion()) renderer.aim(pointInElement(canvas, event));
    };
    const onLeave = (): void => renderer.aim(null);
    image.onload = rebuild;
    image.src = src;
    const observer = new ResizeObserver(rebuild);
    observer.observe(canvas);
    area?.addEventListener("pointermove", onMove);
    area?.addEventListener("pointerleave", onLeave);
    return () => {
      renderer.stop();
      observer.disconnect();
      area?.removeEventListener("pointermove", onMove);
      area?.removeEventListener("pointerleave", onLeave);
    };
  }, [canvasRef, src, cell, color]);
};
