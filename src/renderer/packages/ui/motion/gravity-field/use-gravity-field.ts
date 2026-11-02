import { useEffect, type RefObject } from "react";
import { pointInElement } from "../shared/point";
import { prefersReducedMotion } from "../shared/reduced-motion";
import { createGravityRenderer, type GravityRenderer } from "./gravity-renderer";

type PointerLike = PointerEvent | DragEvent;

const attachGravityListeners = (canvas: HTMLCanvasElement, area: HTMLElement, renderer: GravityRenderer): (() => void) => {
  const onMove = (event: PointerLike): void => renderer.aim(pointInElement(canvas, event));
  const onLeave = (): void => renderer.aim(null);
  const onDragLeave = (event: DragEvent): void => {
    if (event.relatedTarget === null) renderer.aim(null);
  };
  const onDrop = (event: DragEvent): void => {
    renderer.aim(null);
    renderer.pulse(pointInElement(canvas, event));
  };
  area.addEventListener("pointermove", onMove);
  area.addEventListener("pointerleave", onLeave);
  window.addEventListener("dragover", onMove);
  window.addEventListener("dragleave", onDragLeave);
  window.addEventListener("drop", onDrop);
  return () => {
    area.removeEventListener("pointermove", onMove);
    area.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("dragover", onMove);
    window.removeEventListener("dragleave", onDragLeave);
    window.removeEventListener("drop", onDrop);
  };
};

export const useGravityField = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const area = canvas?.parentElement;
    if (!canvas || !area) return;
    const renderer = createGravityRenderer(canvas);
    const observer = new ResizeObserver(renderer.resize);
    observer.observe(canvas);
    const detach = prefersReducedMotion() ? undefined : attachGravityListeners(canvas, area, renderer);
    return () => {
      detach?.();
      renderer.stop();
      observer.disconnect();
    };
  }, [canvasRef]);
};
