import { MODEL_INPUT_SIZE } from "@bitgrain/engine/background/model-config";

const PNG_MIME = "image/png";

const context2d = (canvas: OffscreenCanvas): OffscreenCanvasRenderingContext2D => {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2d context in the background worker");
  return context;
};

const buildMaskCanvas = (maskRgba: Uint8ClampedArray<ArrayBuffer>): OffscreenCanvas => {
  const canvas = new OffscreenCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  context2d(canvas).putImageData(new ImageData(maskRgba, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE), 0, 0);
  return canvas;
};

export const composeCutOut = async (bitmap: ImageBitmap, maskRgba: Uint8ClampedArray<ArrayBuffer>): Promise<Blob> => {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = context2d(canvas);
  context.drawImage(bitmap, 0, 0);
  context.globalCompositeOperation = "destination-in";
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(buildMaskCanvas(maskRgba), 0, 0, bitmap.width, bitmap.height);
  return canvas.convertToBlob({ type: PNG_MIME });
};
