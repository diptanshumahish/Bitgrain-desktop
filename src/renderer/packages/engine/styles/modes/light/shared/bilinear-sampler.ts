import { RGB, type FloatImage } from "./float-image";

const HALF_PIXEL = 0.5;

export const sampleChannel = (image: FloatImage, x: number, y: number, channel: number): number => {
  const lastColumn = image.width - 1;
  const lastRow = image.height - 1;
  const sourceX = Math.min(lastColumn, Math.max(0, x - HALF_PIXEL));
  const sourceY = Math.min(lastRow, Math.max(0, y - HALF_PIXEL));
  const left = Math.floor(sourceX);
  const top = Math.floor(sourceY);
  const right = left < lastColumn ? left + 1 : left;
  const bottom = top < lastRow ? top + 1 : top;
  const weightX = sourceX - left;
  const weightY = sourceY - top;
  const data = image.data;
  const upper = data[(top * image.width + left) * RGB + channel] * (1 - weightX) + data[(top * image.width + right) * RGB + channel] * weightX;
  const lower = data[(bottom * image.width + left) * RGB + channel] * (1 - weightX) + data[(bottom * image.width + right) * RGB + channel] * weightX;
  return upper + (lower - upper) * weightY;
};

export const sampleInto = (image: FloatImage, x: number, y: number, out: Float32Array): void => {
  const lastColumn = image.width - 1;
  const lastRow = image.height - 1;
  const sourceX = Math.min(lastColumn, Math.max(0, x - HALF_PIXEL));
  const sourceY = Math.min(lastRow, Math.max(0, y - HALF_PIXEL));
  const left = Math.floor(sourceX);
  const top = Math.floor(sourceY);
  const weightX = sourceX - left;
  const weightY = sourceY - top;
  const topLeft = (top * image.width + left) * RGB;
  const topRight = topLeft + (left < lastColumn ? RGB : 0);
  const bottomLeft = topLeft + (top < lastRow ? image.width * RGB : 0);
  const bottomRight = bottomLeft + (topRight - topLeft);
  const data = image.data;
  for (let channel = 0; channel < RGB; channel++) {
    const upper = data[topLeft + channel] + (data[topRight + channel] - data[topLeft + channel]) * weightX;
    const lower = data[bottomLeft + channel] + (data[bottomRight + channel] - data[bottomLeft + channel]) * weightX;
    out[channel] = upper + (lower - upper) * weightY;
  }
};
