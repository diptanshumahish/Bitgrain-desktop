const MAX_PAGE_FRACTION = 0.5;
const MIN_IMAGE_EDGE = 48;
const DEFAULT_IMAGE_EDGE = 240;
const CASCADE_STEP_PX = 32;
const HALF = 2;

interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

export interface NewImageOptions {
  name?: string;
  width?: number;
  height?: number;
  center?: Point;
  cascade?: number;
  replaceLayerId?: string;
}

export function fitNewImageSize(natural: Partial<Size> | undefined, page: Size): Size {
  const naturalWidth = natural?.width || DEFAULT_IMAGE_EDGE;
  const naturalHeight = natural?.height || naturalWidth;
  const fitScale = Math.min(
    (page.width * MAX_PAGE_FRACTION) / naturalWidth,
    (page.height * MAX_PAGE_FRACTION) / naturalHeight,
  );
  const minimumScale = MIN_IMAGE_EDGE / Math.max(naturalWidth, naturalHeight);
  const scale = Math.max(Math.min(1, fitScale), minimumScale);
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
}

export function placeNewImage(size: Size, page: Size, opts?: NewImageOptions): Point {
  const center = opts?.center ?? { x: page.width / HALF, y: page.height / HALF };
  const shift = (opts?.cascade ?? 0) * CASCADE_STEP_PX;
  return {
    x: Math.round(center.x - size.width / HALF + shift),
    y: Math.round(center.y - size.height / HALF + shift),
  };
}
