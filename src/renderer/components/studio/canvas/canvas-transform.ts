export const DOT_SIZE = 20;
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 4;
export const TRACKPAD_DELTA_THRESHOLD = 50;
export const ZOOM_MOUSE_SENSITIVITY = 0.0015;
export const ZOOM_TRACKPAD_SENSITIVITY = 0.012;

const DOT_SCREEN_MIN = 14;
const DOT_SCREEN_MAX = 36;

// Below this zoom the canvas downscales layers heavily; nearest-neighbor
// (pixelated) rendering then produces moire/edge lines, so images switch to
// smooth scaling. At or above it, pixelated is kept to match the export look.
export const PIXELATE_MIN_SCALE = 0.75;

// Keeps the backdrop dot grid at a comfortable on-screen spacing at any zoom by
// stepping the base spacing in powers of two, instead of letting it collapse
// into a mush when zoomed out or spread too far apart when zoomed in.
export const adaptiveDotSpacing = (zoom: number): number => {
  let spacing = DOT_SIZE * zoom;
  if (!(spacing > 0)) return DOT_SIZE;
  while (spacing < DOT_SCREEN_MIN) spacing *= 2;
  while (spacing > DOT_SCREEN_MAX) spacing /= 2;
  return spacing;
};

export const applyTransform = (
  panEl: HTMLDivElement | null,
  zoomEl: HTMLDivElement | null,
  wrapEl: HTMLDivElement | null,
  x: number,
  y: number,
  z: number,
): void => {
  if (panEl) panEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  if (zoomEl) zoomEl.style.transform = `scale(${z})`;
  if (wrapEl) {
    const sp = adaptiveDotSpacing(z);
    wrapEl.style.backgroundSize = `${sp}px ${sp}px`;
    wrapEl.style.backgroundPosition = `${((x % sp) + sp) % sp}px ${((y % sp) + sp) % sp}px`;
  }
};
