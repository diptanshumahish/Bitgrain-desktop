const PREVIEW_CANVAS_ID = "transformation-output-canvas";

const copyBox = (overlay: HTMLElement, target: HTMLElement): void => {
  overlay.style.left = `${target.offsetLeft}px`;
  overlay.style.top = `${target.offsetTop}px`;
  overlay.style.width = `${target.offsetWidth}px`;
  overlay.style.height = `${target.offsetHeight}px`;
};

export const matchPreviewCanvasBox = (overlay: HTMLElement): (() => void) => {
  const target = document.getElementById(PREVIEW_CANVAS_ID);
  if (!target) return () => undefined;
  copyBox(overlay, target);
  const observer = new ResizeObserver(() => copyBox(overlay, target));
  observer.observe(target);
  return () => observer.disconnect();
};
