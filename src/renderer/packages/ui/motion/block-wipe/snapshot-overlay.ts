const OVERLAY_CLASS = "absolute pointer-events-none z-[1]";
const PIXELATED_CLASS = "rendering-pixelated";

export interface SnapshotOverlay {
  canvas: HTMLCanvasElement;
  snapshot: HTMLCanvasElement;
}

const copyPixels = (source: HTMLCanvasElement): HTMLCanvasElement | null => {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  const context = copy.getContext("2d");
  if (!context) return null;
  context.drawImage(source, 0, 0);
  return copy;
};

export const createSnapshotOverlay = (source: HTMLCanvasElement): SnapshotOverlay | null => {
  const host = source.offsetParent;
  const snapshot = copyPixels(source);
  if (!host || !snapshot) return null;
  const canvas = document.createElement("canvas");
  canvas.className = source.classList.contains(PIXELATED_CLASS) ? `${OVERLAY_CLASS} ${PIXELATED_CLASS}` : OVERLAY_CLASS;
  canvas.width = source.width;
  canvas.height = source.height;
  canvas.style.left = `${source.offsetLeft}px`;
  canvas.style.top = `${source.offsetTop}px`;
  canvas.style.width = `${source.offsetWidth}px`;
  canvas.style.height = `${source.offsetHeight}px`;
  canvas.getContext("2d")?.drawImage(snapshot, 0, 0);
  host.appendChild(canvas);
  return { canvas, snapshot };
};
