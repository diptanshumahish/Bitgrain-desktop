import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { COMPONENT_DRAG_MIME, emitComponentAction, type ComponentDropPoint } from "@bitgrain/studio-core/components/events/component-events";

interface UseComponentDropArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  zoomContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pages: TemplatePage[];
}

const carriesComponent = (event: DragEvent): boolean => event.dataTransfer?.types.includes(COMPONENT_DRAG_MIME) ?? false;

const pagePointAt = (pages: TemplatePage[], worldX: number, worldY: number): ComponentDropPoint | null => {
  const page = pages.find(
    (candidate) =>
      worldX >= candidate.x && worldX <= candidate.x + candidate.width &&
      worldY >= candidate.y && worldY <= candidate.y + candidate.height,
  );
  return page ? { pageId: page.id, x: worldX - page.x, y: worldY - page.y } : null;
};

export const useComponentDrop = ({ wrapRef, zoomContainerRef, zoom, pages }: UseComponentDropArgs): void => {
  const latestRef = useRef({ zoom, pages });

  useEffect(() => {
    latestRef.current = { zoom, pages };
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onDragOver = (event: DragEvent): void => {
      if (!carriesComponent(event) || !event.dataTransfer) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    const onDrop = (event: DragEvent): void => {
      const componentId = event.dataTransfer?.getData(COMPONENT_DRAG_MIME);
      const box = zoomContainerRef.current?.getBoundingClientRect();
      if (!componentId || !box) return;
      event.preventDefault();
      const { zoom: currentZoom, pages: currentPages } = latestRef.current;
      const drop = pagePointAt(currentPages, (event.clientX - box.left) / currentZoom, (event.clientY - box.top) / currentZoom);
      emitComponentAction({ kind: "insert", componentId, drop });
    };
    wrap.addEventListener("dragover", onDragOver);
    wrap.addEventListener("drop", onDrop);
    return () => {
      wrap.removeEventListener("dragover", onDragOver);
      wrap.removeEventListener("drop", onDrop);
    };
  }, [wrapRef, zoomContainerRef]);
};
