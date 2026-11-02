import type { Frame } from "../../../engine/frame";
import type { SourceImage } from "../../../engine/style-definition";
import type { ParamValues } from "../../../engine/style-types";
import { toneAdjustedSource } from "../../../finish/frame-tone";
import { lumaOfRgb } from "./light-maths";

export const RGB = 3;
const RGBA = 4;
const BYTE = 255;

export interface FloatImage {
  data: Float32Array;
  width: number;
  height: number;
}

export const toFloatImage = (source: SourceImage): FloatImage => {
  const count = source.width * source.height;
  const data = new Float32Array(count * RGB);
  for (let pixel = 0; pixel < count; pixel++) {
    data[pixel * RGB] = source.data[pixel * RGBA] / BYTE;
    data[pixel * RGB + 1] = source.data[pixel * RGBA + 1] / BYTE;
    data[pixel * RGB + 2] = source.data[pixel * RGBA + 2] / BYTE;
  }
  return { data, width: source.width, height: source.height };
};

export const tonedImage = (source: SourceImage, params: ParamValues): FloatImage =>
  toFloatImage(toneAdjustedSource(source, params));

export const lumaPlane = (image: FloatImage): Float32Array => {
  const count = image.width * image.height;
  const plane = new Float32Array(count);
  for (let pixel = 0; pixel < count; pixel++) {
    plane[pixel] = lumaOfRgb(image.data[pixel * RGB], image.data[pixel * RGB + 1], image.data[pixel * RGB + 2]);
  }
  return plane;
};

export const writeFloatRgb = (frame: Frame, rgb: Float32Array): void => {
  const count = frame.width * frame.height;
  const out = new Uint8ClampedArray(count * RGBA);
  for (let pixel = 0; pixel < count; pixel++) {
    out[pixel * RGBA] = rgb[pixel * RGB] * BYTE;
    out[pixel * RGBA + 1] = rgb[pixel * RGB + 1] * BYTE;
    out[pixel * RGBA + 2] = rgb[pixel * RGB + 2] * BYTE;
    out[pixel * RGBA + 3] = BYTE;
  }
  frame.writePixels(out);
};
