import { gaussianBlurPixels } from "./box-blur";

const SIGMA_PER_DOWNSCALE = 2;
const MAX_DOWNSCALE = 8;

export interface SoftCopy {
  canvas: OffscreenCanvas;
  width: number;
  height: number;
}

const downscaleFor = (sigma: number): number =>
  Math.min(MAX_DOWNSCALE, Math.max(1, Math.floor(sigma / SIGMA_PER_DOWNSCALE)));

export const softCopy = (source: CanvasImageSource, width: number, height: number, sigma: number): SoftCopy => {
  const factor = downscaleFor(sigma);
  const smallWidth = Math.max(1, Math.round(width / factor));
  const smallHeight = Math.max(1, Math.round(height / factor));
  const canvas = new OffscreenCanvas(smallWidth, smallHeight);
  const context = canvas.getContext("2d");
  if (!context) return { canvas, width: smallWidth, height: smallHeight };
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, smallWidth, smallHeight);
  const image = context.getImageData(0, 0, smallWidth, smallHeight);
  gaussianBlurPixels(image.data, smallWidth, smallHeight, sigma / factor);
  context.putImageData(image, 0, 0);
  return { canvas, width: smallWidth, height: smallHeight };
};

export const drawSoftCopy = (target: OffscreenCanvasRenderingContext2D, copy: SoftCopy, width: number, height: number): void => {
  target.imageSmoothingEnabled = true;
  target.imageSmoothingQuality = "high";
  target.drawImage(copy.canvas, 0, 0, copy.width, copy.height, 0, 0, width, height);
};
