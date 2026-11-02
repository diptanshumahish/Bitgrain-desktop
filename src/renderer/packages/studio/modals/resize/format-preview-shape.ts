import { orientationOf, type Orientation } from "../studio-dialog/orientation";

const WIDE_RATIO = 2.5;
const WIDE_SHAPE_CLASS = "h-4 w-12";

const PREVIEW_SHAPE_CLASS: Record<Orientation, string> = {
  square: "h-9 w-9",
  landscape: "h-7 w-12",
  portrait: "h-10 w-8",
  tall: "h-11 w-6",
};

export const previewShapeClass = (width: number, height: number): string => {
  if (width / height >= WIDE_RATIO) return WIDE_SHAPE_CLASS;
  return PREVIEW_SHAPE_CLASS[orientationOf(width, height)];
};
