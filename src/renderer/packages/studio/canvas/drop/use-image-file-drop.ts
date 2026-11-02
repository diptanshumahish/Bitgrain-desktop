import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { ImagePlacementPoint } from "../../plugins/host/types";
import { ingestDataTransferImages } from "../../editor/studio-image-intake";
import { findImageLayerAt } from "./find-image-layer-at";

interface UseImageFileDropArgs {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  zoomContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pages: TemplatePage[];
  activePageId: string;
}

const hasFiles = (event: DragEvent): boolean => (event.dataTransfer?.files.length ?? 0) > 0;

const pointOnPage = (page: TemplatePage | undefined, worldX: number, worldY: number): ImagePlacementPoint | undefined => {
  if (!page) return undefined;
  const x = worldX - page.x;
  const y = worldY - page.y;
  const inside = x >= 0 && y >= 0 && x <= page.width && y <= page.height;
  return inside ? { x, y } : undefined;
};

export const useImageFileDrop = ({ wrapRef, zoomContainerRef, zoom, pages, activePageId }: UseImageFileDropArgs): void => {
  const latestRef = useRef({ zoom, pages, activePageId });

  useEffect(() => {
    latestRef.current = { zoom, pages, activePageId };
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onDrop = (event: DragEvent): void => {
      const box = zoomContainerRef.current?.getBoundingClientRect();
      if (!hasFiles(event) || !box || !event.dataTransfer) return;
      event.preventDefault();
      event.stopPropagation();
      const current = latestRef.current;
      const page = current.pages.find((candidate) => candidate.id === current.activePageId);
      const worldX = (event.clientX - box.left) / current.zoom;
      const worldY = (event.clientY - box.top) / current.zoom;
      const point = pointOnPage(page, worldX, worldY);
      const replaceLayerId = page && point ? findImageLayerAt(page.layers, point) ?? undefined : undefined;
      ingestDataTransferImages(event.dataTransfer, point, replaceLayerId);
    };
    wrap.addEventListener("drop", onDrop);
    return () => wrap.removeEventListener("drop", onDrop);
  }, [wrapRef, zoomContainerRef]);
};
