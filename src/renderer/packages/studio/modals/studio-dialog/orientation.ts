export type Orientation = "square" | "landscape" | "portrait" | "tall";

const TALL_RATIO = 1.6;

export const orientationOf = (width: number, height: number): Orientation => {
  const ratio = height / width;
  if (ratio === 1) return "square";
  if (ratio < 1) return "landscape";
  if (ratio >= TALL_RATIO) return "tall";
  return "portrait";
};
