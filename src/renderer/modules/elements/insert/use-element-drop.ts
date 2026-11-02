import { useEffect, useRef } from "react";
import type { TemplatePage } from "../../../data/studioTypes";
import { ELEMENT_DRAG_MIME, emitInsertElement, type ElementDropPoint } from "./element-insert-events";

interface UseElementDropArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  zoomContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pages: TemplatePage[];
}

const hasElement = (event: DragEvent): boolean => event.dataTransfer?.types.includes(ELEMENT_DRAG_MIME) ?? false;

const pagePointAt = (pages: TemplatePage[], worldX: number, worldY: number): ElementDropPoint | null => {
  const page = pages.find(
    (candidate) =>
      worldX >= candidate.x && worldX <= candidate.x + candidate.width &&
      worldY >= candidate.y && worldY <= candidate.y + candidate.height,
  );
  return page ? { pageId: page.id, x: worldX - page.x, y: worldY - page.y } : null;
};

export const useElementDrop = ({ wrapRef, zoomContainerRef, zoom, pages }: UseElementDropArgs): void => {
  const latestRef = useRef({ zoom, pages });

  useEffect(() => {
    latestRef.current = { zoom, pages };
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onDragOver = (event: DragEvent): void => {
      if (!hasElement(event) || !event.dataTransfer) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    const onDrop = (event: DragEvent): void => {
      const elementId = event.dataTransfer?.getData(ELEMENT_DRAG_MIME);
      const box = zoomContainerRef.current?.getBoundingClientRect();
      if (!elementId || !box) return;
      event.preventDefault();
      const { zoom: currentZoom, pages: currentPages } = latestRef.current;
      const drop = pagePointAt(currentPages, (event.clientX - box.left) / currentZoom, (event.clientY - box.top) / currentZoom);
      emitInsertElement({ elementId, drop });
    };
    wrap.addEventListener("dragover", onDragOver);
    wrap.addEventListener("drop", onDrop);
    return () => {
      wrap.removeEventListener("dragover", onDragOver);
      wrap.removeEventListener("drop", onDrop);
    };
  }, [wrapRef, zoomContainerRef]);
};
