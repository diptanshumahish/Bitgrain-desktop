import { useEffect, type RefObject } from "react";
import { previewViewSignal, panBy, zoomAround } from "./preview-zoom-store";
import { attachDragPan } from "./attach-drag-pan";

const WHEEL_ZOOM_SPEED = 0.01;

const applyView = (content: HTMLElement): void => {
  const { scale, x, y } = previewViewSignal.value;
  content.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
};

const zoomWithWheel = (stage: HTMLElement, event: WheelEvent): void => {
  const rect = stage.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - rect.width / 2;
  const offsetY = event.clientY - rect.top - rect.height / 2;
  zoomAround(Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED), offsetX, offsetY);
};

const panWithWheel = (event: WheelEvent): void => {
  const horizontalFromShift = event.shiftKey && event.deltaX === 0;
  panBy(horizontalFromShift ? -event.deltaY : -event.deltaX, horizontalFromShift ? 0 : -event.deltaY);
};

const attachWheelZoom = (stage: HTMLElement): (() => void) => {
  const onWheel = (event: WheelEvent): void => {
    const zooming = event.metaKey || event.ctrlKey;
    if (!zooming && previewViewSignal.value.fit) return;
    event.preventDefault();
    if (zooming) zoomWithWheel(stage, event);
    else panWithWheel(event);
  };
  stage.addEventListener("wheel", onWheel, { passive: false });
  return () => stage.removeEventListener("wheel", onWheel);
};

const syncView = (stage: HTMLElement, content: HTMLElement): void => {
  applyView(content);
  stage.dataset.zoomed = String(!previewViewSignal.value.fit);
};

const attachViewSync = (stage: HTMLElement, content: HTMLElement): (() => void) => {
  syncView(stage, content);
  return previewViewSignal.subscribe(() => syncView(stage, content));
};

export const usePreviewZoom = (
  stageRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
): void => {
  useEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;
    const detachers = [attachWheelZoom(stage), attachDragPan(stage), attachViewSync(stage, content)];
    return () => detachers.forEach((detach) => detach());
  }, [stageRef, contentRef]);
};
