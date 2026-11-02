import type { SourceImage } from "../../../engine/style-definition";

const CHANNELS = 4;

const clampCoord = (value: number, size: number): number => (value < 0 ? 0 : value > size - 1 ? size - 1 : value);

export const nearestIndex = (source: SourceImage, x: number, y: number): number => {
  const column = Math.round(clampCoord(x, source.width));
  const row = Math.round(clampCoord(y, source.height));
  return (row * source.width + column) * CHANNELS;
};

export const bilinearChannel = (source: SourceImage, x: number, y: number, channel: number): number => {
  const clampedX = clampCoord(x, source.width);
  const clampedY = clampCoord(y, source.height);
  const left = Math.floor(clampedX);
  const top = Math.floor(clampedY);
  const right = left + 1 < source.width ? left + 1 : left;
  const bottom = top + 1 < source.height ? top + 1 : top;
  const weightX = clampedX - left;
  const weightY = clampedY - top;
  const data = source.data;
  const rowTop = top * source.width;
  const rowBottom = bottom * source.width;
  const upper = data[(rowTop + left) * CHANNELS + channel] * (1 - weightX) + data[(rowTop + right) * CHANNELS + channel] * weightX;
  const lower = data[(rowBottom + left) * CHANNELS + channel] * (1 - weightX) + data[(rowBottom + right) * CHANNELS + channel] * weightX;
  return upper + (lower - upper) * weightY;
};
