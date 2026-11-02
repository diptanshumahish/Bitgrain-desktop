export const ZOOM_SCOPE_ATTRIBUTE = "data-canvas-zoom-scope";
export const CANVAS_ZOOM_VAR = "--canvas-zoom";

export const syncZoomScopes = (root: HTMLElement, zoom: number): void => {
  root.querySelectorAll<HTMLElement>(`[${ZOOM_SCOPE_ATTRIBUTE}]`).forEach((scope) => {
    scope.style.setProperty(CANVAS_ZOOM_VAR, String(zoom));
  });
};
