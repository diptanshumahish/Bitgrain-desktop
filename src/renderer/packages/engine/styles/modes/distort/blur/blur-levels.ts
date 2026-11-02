import { frameFromPixels } from "../../../engine/frame";
import type { SourceImage } from "../../../engine/style-definition";
import { drawSoftCopy, softCopy } from "../../../finish/soft-copy";

export const blurredPixels = (source: SourceImage, sigma: number): Uint8ClampedArray => {
  const photo = frameFromPixels(source.data, source.width, source.height);
  const copy = softCopy(photo.canvas, source.width, source.height, sigma);
  const target = new OffscreenCanvas(source.width, source.height);
  const context = target.getContext("2d");
  if (!context) return new Uint8ClampedArray(source.data);
  drawSoftCopy(context, copy, source.width, source.height);
  return context.getImageData(0, 0, source.width, source.height).data;
};
