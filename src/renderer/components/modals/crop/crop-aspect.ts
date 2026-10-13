export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CropAspectOption {
  id: string;
  label: string;
  ratio: number | null;
}

const SQUARE = 1;
const PORTRAIT_FOUR_FIVE = 4 / 5;
const STORY_NINE_SIXTEEN = 9 / 16;
const WIDE_SIXTEEN_NINE = 16 / 9;

export const CROP_ASPECT_OPTIONS: CropAspectOption[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: SQUARE },
  { id: "4:5", label: "4:5", ratio: PORTRAIT_FOUR_FIVE },
  { id: "9:16", label: "9:16", ratio: STORY_NINE_SIXTEEN },
  { id: "16:9", label: "16:9", ratio: WIDE_SIXTEEN_NINE },
];

const HALF = 2;

export const centeredAspectRect = (boundsW: number, boundsH: number, ratio: number): CropRect => {
  const fitsByWidth = boundsW / ratio <= boundsH;
  const w = fitsByWidth ? boundsW : boundsH * ratio;
  const h = fitsByWidth ? boundsW / ratio : boundsH;
  return { x: (boundsW - w) / HALF, y: (boundsH - h) / HALF, w, h };
};

export const lockRectToAspect = (
  rect: CropRect,
  anchorRight: boolean,
  anchorBottom: boolean,
  ratio: number,
  boundsW: number,
  boundsH: number,
): CropRect => {
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;
  const roomW = anchorRight ? right : boundsW - rect.x;
  const roomH = anchorBottom ? bottom : boundsH - rect.y;
  const w = Math.min(rect.w, roomW, roomH * ratio);
  const h = w / ratio;
  return {
    x: anchorRight ? right - w : rect.x,
    y: anchorBottom ? bottom - h : rect.y,
    w,
    h,
  };
};
