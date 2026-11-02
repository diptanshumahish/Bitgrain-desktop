import type { SourceImage } from "../../../../engine/style-definition";
import { CHANNEL_MAX, CHANNELS, LUMA_BLUE, LUMA_GREEN, LUMA_RED, clampToGrid } from "./screen-math";

export const unitLumaBuffer = (source: SourceImage): Float32Array => {
  const count = source.width * source.height;
  const luma = new Float32Array(count);
  const data = source.data;
  for (let pixel = 0; pixel < count; pixel++) {
    const index = pixel * CHANNELS;
    luma[pixel] = (LUMA_RED * data[index] + LUMA_GREEN * data[index + 1] + LUMA_BLUE * data[index + 2]) / CHANNEL_MAX;
  }
  return luma;
};

export const opaqueBuffer = (width: number, height: number): Uint8ClampedArray => {
  const data = new Uint8ClampedArray(width * height * CHANNELS);
  for (let index = 3; index < data.length; index += CHANNELS) data[index] = CHANNEL_MAX;
  return data;
};

export const pixelIndexAt = (source: SourceImage, x: number, y: number): number =>
  (clampToGrid(y, source.height) * source.width + clampToGrid(x, source.width)) * CHANNELS;
