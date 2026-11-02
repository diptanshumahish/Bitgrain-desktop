import { useEffect, useLayoutEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { canvasViewRequestSignal } from "../state/canvas-fit-request";
import type { CanvasViewport } from "./use-canvas-viewport";

interface ViewportSyncConfig {
  viewport: CanvasViewport;
  activePage: TemplatePage | undefined;
  pageCount: number;
}

export const useViewportSync = ({ viewport, activePage, pageCount }: ViewportSyncConfig): void => {
  const viewRequest = useSignalValue(canvasViewRequestSignal);
  const activePageRef = useRef(activePage);
  const pageCountRef = useRef(pageCount);

  useLayoutEffect(() => {
    activePageRef.current = activePage;
  });

  useLayoutEffect(() => {
    const page = activePageRef.current;
    if (viewRequest.kind === "zoom") viewport.zoomTo(viewRequest.zoom);
    else if (viewRequest.kind === "focus") viewport.focusPoint(viewRequest.rect, viewRequest.point);
    else if (page) viewport.fitToRect(page);
  }, [viewRequest, viewport]);

  useEffect(() => {
    const previousCount = pageCountRef.current;
    pageCountRef.current = pageCount;
    const page = activePageRef.current;
    if (pageCount > previousCount && page) viewport.centerOnRect(page);
  }, [pageCount, viewport]);
};
