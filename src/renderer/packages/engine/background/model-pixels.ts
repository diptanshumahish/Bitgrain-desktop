import { MODEL_INPUT_SIZE } from "./model-config";

export const readModelPixels = (image: CanvasImageSource): Uint8ClampedArray => {
  const canvas = new OffscreenCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2d context for the background model");
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  return context.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE).data;
};
