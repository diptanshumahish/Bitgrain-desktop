import { useCallback, useMemo } from "react";
import { applyTransform } from "./canvas-transform";
import {
  centerRect,
  clampZoom,
  fitRect,
  zoomAroundPoint,
  type ViewportRect,
  type ViewportState,
} from "./viewport-math";

const ZOOM_STEP_FACTOR = 1.25;
const ACTUAL_SIZE_ZOOM = 1;
const HALF = 2;

interface CanvasViewportConfig {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  panContainerRef: React.RefObject<HTMLDivElement | null>;
  zoomContainerRef: React.RefObject<HTMLDivElement | null>;
  panRef: React.MutableRefObject<{ x: number; y: number }>;
  zoomRef: React.MutableRefObject<number>;
  onZoomChange: (zoom: number) => void;
}

export interface CanvasViewport {
  fitToRect: (rect: ViewportRect) => void;
  centerOnRect: (rect: ViewportRect) => void;
  zoomTo: (zoom: number) => void;
  zoomStep: (direction: 1 | -1) => void;
  zoomToActualSize: () => void;
}

export const useCanvasViewport = ({
  wrapRef, panContainerRef, zoomContainerRef, panRef, zoomRef, onZoomChange,
}: CanvasViewportConfig): CanvasViewport => {
  const commit = useCallback((state: ViewportState): void => {
    panRef.current = { x: state.panX, y: state.panY };
    zoomRef.current = state.zoom;
    applyTransform(panContainerRef.current, zoomContainerRef.current, wrapRef.current, state.panX, state.panY, state.zoom);
    onZoomChange(state.zoom);
  }, [panRef, zoomRef, panContainerRef, zoomContainerRef, wrapRef, onZoomChange]);

  const readViewport = useCallback(() => {
    const wrap = wrapRef.current;
    return wrap ? { width: wrap.clientWidth, height: wrap.clientHeight } : null;
  }, [wrapRef]);

  const fitToRect = useCallback((rect: ViewportRect): void => {
    const viewport = readViewport();
    if (viewport && rect.width > 0 && rect.height > 0) commit(fitRect(rect, viewport));
  }, [readViewport, commit]);

  const centerOnRect = useCallback((rect: ViewportRect): void => {
    const viewport = readViewport();
    if (viewport) commit(centerRect(rect, viewport, zoomRef.current));
  }, [readViewport, commit, zoomRef]);

  const zoomTo = useCallback((zoom: number): void => {
    const viewport = readViewport();
    if (!viewport) return;
    const current = { panX: panRef.current.x, panY: panRef.current.y, zoom: zoomRef.current };
    commit(zoomAroundPoint(current, clampZoom(zoom), viewport.width / HALF, viewport.height / HALF));
  }, [readViewport, commit, panRef, zoomRef]);

  const zoomStep = useCallback((direction: 1 | -1): void => {
    const factor = direction === 1 ? ZOOM_STEP_FACTOR : 1 / ZOOM_STEP_FACTOR;
    zoomTo(zoomRef.current * factor);
  }, [zoomTo, zoomRef]);

  const zoomToActualSize = useCallback((): void => zoomTo(ACTUAL_SIZE_ZOOM), [zoomTo]);

  return useMemo(
    () => ({ fitToRect, centerOnRect, zoomTo, zoomStep, zoomToActualSize }),
    [fitToRect, centerOnRect, zoomTo, zoomStep, zoomToActualSize],
  );
};
