import { Frame, frameFromPixels } from "../../../../engine/frame";
import type { SourceImage } from "../../../../engine/style-definition";
import { CHANNEL_MAX, CHANNELS, PERCENT } from "../shared/screen-math";
import { RGB_STRIDE } from "./dither-job";

const HALF = 0.5;

interface DitherGrid {
  width: number;
  height: number;
  rgb: Float32Array;
}

const contrasted = (value: number, contrast: number): number =>
  Math.min(CHANNEL_MAX, Math.max(0, ((value / CHANNEL_MAX - HALF) * contrast + HALF) * CHANNEL_MAX));

export const downscaleForDither = (source: SourceImage, pixelSize: number, contrast: number): DitherGrid => {
  const width = Math.max(1, Math.round(source.width / pixelSize));
  const height = Math.max(1, Math.round(source.height / pixelSize));
  const small = new Frame(width, height);
  const context = small.context;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(frameFromPixels(source.data, source.width, source.height).canvas, 0, 0, width, height);
  const pixels = small.readPixels();
  const rgb = new Float32Array(width * height * RGB_STRIDE);
  const factor = contrast / PERCENT;
  for (let pixel = 0; pixel < width * height; pixel++) {
    for (let channel = 0; channel < RGB_STRIDE; channel++) rgb[pixel * RGB_STRIDE + channel] = contrasted(pixels[pixel * CHANNELS + channel], factor);
  }
  return { width, height, rgb };
};

export const paintDitherGrid = (frame: Frame, output: Uint8ClampedArray, width: number, height: number): void => {
  const small = frameFromPixels(output, width, height);
  const context = frame.context;
  context.imageSmoothingEnabled = false;
  context.drawImage(small.canvas, 0, 0, frame.width, frame.height);
  context.imageSmoothingEnabled = true;
};
