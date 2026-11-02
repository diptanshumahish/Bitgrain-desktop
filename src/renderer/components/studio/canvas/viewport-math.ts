import { ZOOM_MAX, ZOOM_MIN } from "./canvas-transform";

const FIT_SIDE_PADDING_PX = 56;
const FIT_TOP_PADDING_PX = 48;
const FIT_BOTTOM_RESERVED_PX = 112;
const FIT_ZOOM_CAP = 1;

export interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ViewportState {
  panX: number;
  panY: number;
  zoom: number;
}

export const clampZoom = (zoom: number): number => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));

const availableArea = (viewport: ViewportSize): ViewportSize => ({
  width: Math.max(1, viewport.width - FIT_SIDE_PADDING_PX * 2),
  height: Math.max(1, viewport.height - FIT_TOP_PADDING_PX - FIT_BOTTOM_RESERVED_PX),
});

export function centerRect(rect: ViewportRect, viewport: ViewportSize, zoom: number): ViewportState {
  const area = availableArea(viewport);
  return {
    zoom,
    panX: FIT_SIDE_PADDING_PX + (area.width - rect.width * zoom) / 2 - rect.x * zoom,
    panY: FIT_TOP_PADDING_PX + (area.height - rect.height * zoom) / 2 - rect.y * zoom,
  };
}

export function fitRect(rect: ViewportRect, viewport: ViewportSize): ViewportState {
  const area = availableArea(viewport);
  const fitted = Math.min(area.width / rect.width, area.height / rect.height, FIT_ZOOM_CAP);
  return centerRect(rect, viewport, clampZoom(fitted));
}

export function zoomAroundPoint(
  state: ViewportState,
  nextZoom: number,
  pointX: number,
  pointY: number,
): ViewportState {
  const worldX = (pointX - state.panX) / state.zoom;
  const worldY = (pointY - state.panY) / state.zoom;
  return { zoom: nextZoom, panX: pointX - worldX * nextZoom, panY: pointY - worldY * nextZoom };
}
