const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;
const BYTE_MAX = 255;

export type RasterSource = HTMLImageElement | HTMLCanvasElement;

export interface GrayImage {
  data: Float32Array;
  width: number;
  height: number;
}

export const sourceDimensions = (source: RasterSource): { width: number; height: number } =>
  source instanceof HTMLImageElement
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };

export const toGrayImage = (source: RasterSource, maxEdge: number): GrayImage | null => {
  const { width: sourceW, height: sourceH } = sourceDimensions(source);
  if (sourceW <= 0 || sourceH <= 0) return null;

  const scale = Math.min(1, maxEdge / Math.max(sourceW, sourceH));
  const width = Math.max(1, Math.round(sourceW * scale));
  const height = Math.max(1, Math.round(sourceH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(source, 0, 0, width, height);

  let pixels: ImageData;
  try {
    pixels = context.getImageData(0, 0, width, height);
  } catch {
    return null;
  }

  const data = new Float32Array(width * height);
  for (let index = 0; index < data.length; index += 1) {
    const offset = index * 4;
    data[index] =
      (pixels.data[offset] * LUMA_RED + pixels.data[offset + 1] * LUMA_GREEN + pixels.data[offset + 2] * LUMA_BLUE) /
      BYTE_MAX;
  }
  return { data, width, height };
};

const blurAxis = (input: GrayImage, horizontal: boolean): Float32Array => {
  const { data, width, height } = input;
  const output = new Float32Array(data.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const previousX = horizontal ? Math.max(0, x - 1) : x;
      const nextX = horizontal ? Math.min(width - 1, x + 1) : x;
      const previousY = horizontal ? y : Math.max(0, y - 1);
      const nextY = horizontal ? y : Math.min(height - 1, y + 1);
      output[y * width + x] =
        (data[previousY * width + previousX] + data[y * width + x] * 2 + data[nextY * width + nextX]) / 4;
    }
  }
  return output;
};

export const blurGrayImage = (input: GrayImage): GrayImage => {
  const horizontal = { data: blurAxis(input, true), width: input.width, height: input.height };
  return { data: blurAxis(horizontal, false), width: input.width, height: input.height };
};
