const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;
const BYTE_MAX = 255;
const RGBA_STRIDE = 4;

export const lumaByte = (red: number, green: number, blue: number): number =>
  red * LUMA_RED + green * LUMA_GREEN + blue * LUMA_BLUE;

export const extractLuma = (data: Float32Array, pixelCount: number): Float32Array => {
  const luma = new Float32Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const index = pixel * RGBA_STRIDE;
    const value = lumaByte(data[index], data[index + 1], data[index + 2]) / BYTE_MAX;
    luma[pixel] = value < 0 ? 0 : value > 1 ? 1 : value;
  }
  return luma;
};
